"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DashboardCard } from "@/components/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Drama, FlaskConical, Loader2, AlertTriangle, Workflow, ListChecks } from "lucide-react";
import { format } from "date-fns";
import { api, SarcasmOverview, SarcasmTestResult } from "@/lib/api";
import { isArabicScript } from "@/lib/utils";

const EXAMPLES = [
  "Oh sure, great job ruining everything, real geniuses over there.",
  "Yeah right, as if they ever cared about this district.",
  "The road repair work finished ahead of schedule this week.",
];

export default function SarcasmPage() {
  const [data, setData] = useState<SarcasmOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [result, setResult] = useState<SarcasmTestResult | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    api.getSarcasm().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const runTest = async () => {
    if (!text.trim()) return;
    setTesting(true);
    setResult(await api.testSarcasm(text));
    setTesting(false);
  };

  const cfg = data?.config ?? null;
  const totals = data?.totals ?? { case_files: 0, scored: 0, flagged: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analysis · Agent 03"
        icon={Drama}
        title="Sarcasm Signal"
        description="A secondary check that runs only when the classifier is unsure, so an officer can see whether wording may reverse the apparent meaning of a post."
      />

      {/* The honesty banner is the point of this page, not a disclaimer bolted on:
          presenting a rule-based heuristic as a model would be misleading. */}
      <div className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div className="min-w-0 space-y-1 text-sm">
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            Placeholder — rule-based, not a trained model
          </p>
          <p className="text-muted-foreground">
            {cfg?.note ??
              "Pattern matching over a fixed English marker list. The score is not a calibrated probability and must never be presented to a court or to a subject as evidence of intent."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard title="Case files" icon={ListChecks}>
          {loading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="text-3xl font-bold font-mono tabular-nums">{totals.case_files}</div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Total cases created by the pipeline.</p>
        </DashboardCard>
        <DashboardCard title="Scored for sarcasm" icon={Drama}>
          {loading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="text-3xl font-bold font-mono tabular-nums text-primary">{totals.scored}</div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Only cases whose confidence landed in the ambiguous band
            {cfg && ` (${cfg.runs_between_confidence[0]}–${cfg.runs_between_confidence[1]})`} reach this agent.
          </p>
        </DashboardCard>
        <DashboardCard title="Flagged sarcastic" icon={AlertTriangle}>
          {loading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="text-3xl font-bold font-mono tabular-nums text-amber-500">{totals.flagged}</div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Scored at or above the {cfg?.flag_threshold ?? 0.4} threshold.
          </p>
        </DashboardCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Test the heuristic" icon={FlaskConical}>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Runs the exact function the pipeline uses. Nothing is saved and no case file is created.
            </p>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a post or comment…"
              className="min-h-[90px] resize-none bg-background/50 text-sm"
            />
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setText(ex)}
                  className="max-w-full truncate rounded border border-border/60 px-2 py-1 text-left text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {ex}
                </button>
              ))}
            </div>
            <Button onClick={runTest} disabled={testing || !text.trim()} className="w-full">
              {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
              Run heuristic
            </Button>

            {result && !result.error && (
              <div className="space-y-3 rounded-md border border-border/50 bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-muted-foreground">Score</span>
                  <span className="font-mono text-lg font-bold tabular-nums">{result.score.toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full ${result.flag ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${Math.min(100, result.score * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Verdict</span>
                  <Badge variant={result.flag ? "outline" : "secondary"} className={result.flag ? "border-amber-500/40 text-amber-500" : ""}>
                    {result.flag ? "Possible sarcasm" : "No sarcasm signal"}
                  </Badge>
                </div>
                <div className="space-y-1.5 border-t border-border/40 pt-2 text-xs">
                  {/* a div, not a p: Badge renders a div, and a div inside a p is
                      invalid HTML that React reports as a hydration failure. */}
                  <div className="flex flex-wrap items-center gap-1 text-muted-foreground">
                    <span>Matched markers:</span>
                    {result.matched_markers.length === 0 ? (
                      <span className="italic">none</span>
                    ) : (
                      result.matched_markers.map((m) => (
                        <Badge key={m} variant="secondary" className="font-mono text-[10px]">{m}</Badge>
                      ))
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    Contrast pattern: <span className="font-mono">{String(result.contrast_pattern)}</span>
                  </p>
                </div>
              </div>
            )}
            {result?.error && <p className="text-xs text-destructive">{result.note}</p>}
          </div>
        </DashboardCard>

        <DashboardCard title="The rule, in full" icon={Workflow}>
          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : cfg ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Step 1 — when it runs
                </p>
                <p className="text-muted-foreground">
                  Only when the classifier&apos;s confidence falls between{" "}
                  <span className="font-mono text-foreground">{cfg.runs_between_confidence[0]}</span> and{" "}
                  <span className="font-mono text-foreground">{cfg.runs_between_confidence[1]}</span>. Confident
                  classifications skip this agent entirely.
                </p>
              </div>
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Step 2 — how it scores
                </p>
                <p className="text-muted-foreground">
                  <span className="font-mono text-foreground">{cfg.marker_weight}</span> per matched marker, plus{" "}
                  <span className="font-mono text-foreground">{cfg.contrast_weight}</span> if the praise-then-insult
                  pattern matches, capped at 1.0. Flagged at{" "}
                  <span className="font-mono text-foreground">{cfg.flag_threshold}</span>.
                </p>
              </div>
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Marker list ({cfg.markers.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {cfg.markers.map((m) => (
                    <Badge key={m} variant="secondary" className="font-mono text-[10px]">{m}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Contrast pattern
                </p>
                <code className="block overflow-x-auto rounded bg-muted/40 p-2 font-mono text-[10px] text-foreground">
                  {cfg.contrast_pattern}
                </code>
              </div>
              <div className="rounded border border-dashed border-border/60 p-2.5">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Known limitation:</strong> the markers are English. Sarcasm in
                  Urdu, Roman Urdu, Shina, Balti or Burushaski will not be caught. Replacing this with a trained
                  multilingual model is funded in the Year 1 programme.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Could not load the heuristic configuration.</p>
          )}
        </DashboardCard>
      </div>

      <DashboardCard title="Cases carrying a sarcasm score" icon={ListChecks} noPadding>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-mono text-xs uppercase tracking-wider">Content</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Category</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Confidence</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Sarcasm</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Author</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-wider">Recorded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data && data.recent.length > 0 ? (
                data.recent.map((c) => (
                  <TableRow key={c.id} className="border-border/40 hover:bg-muted/20">
                    <TableCell className="max-w-[380px]">
                      <p
                        className={`truncate text-sm ${isArabicScript(c.text) ? "urdu-inline" : ""}`}
                        title={c.text}
                      >
                        {c.text}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.category === "hate" ? "destructive" : "secondary"} className="uppercase text-[10px]">
                        {c.category ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">
                      {c.confidence !== null ? `${c.confidence.toFixed(0)}%` : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">
                      <span className={c.sarcasm_flag ? "text-amber-500" : "text-muted-foreground"}>
                        {c.sarcasm_score !== null ? c.sarcasm_score.toFixed(2) : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate font-mono text-xs">{c.username ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-muted-foreground">
                      {format(new Date(c.created_at), "dd MMM, HH:mm")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                    No case has landed in the ambiguous confidence band yet, so nothing has been scored.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>
    </div>
  );
}

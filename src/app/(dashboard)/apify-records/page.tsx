"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DashboardCard } from "@/components/dashboard-card";
import { BorderBeam } from "@/components/ui/border-beam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Database,
  FileText,
  MessageSquare,
  Flag,
  Wallet,
  Timer,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  MapPin,
  Gavel,
  Info,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import TimeAgo from "@/components/time-ago";
import { isArabicScript } from "@/lib/utils";
import {
  api,
  ApifyOverview,
  ApifyRun,
  MonitoringUser,
  TargetPost,
} from "@/lib/api";

const ACTIVE = new Set(["STARTING", "RUNNING", "PROCESSING"]);

const fmtDuration = (s: number | null) => {
  if (s === null || s === undefined) return "—";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem ? `${m}m ${rem}s` : `${m}m`;
};

const fmtGap = (s: number | null) => {
  if (s === null || s === undefined) return "—";
  if (s < 3600) return `${Math.round(s / 60)} min`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} hrs`;
  return `${(s / 86400).toFixed(1)} days`;
};

const usd = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;
const pkr = (n: number) => `PKR ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const runStatusClass = (s: string) =>
  s === "SUCCEEDED"
    ? "text-emerald-500 border-emerald-500/40"
    : s === "FAILED"
    ? "text-destructive border-destructive/40"
    : "text-primary border-primary/40";

// Post and comment URLs come back in slightly different shapes, so compare them
// loosely when nesting comments under the post they belong to.
const norm = (u: string | null) => (u || "").split("?")[0].replace(/\/+$/, "").toLowerCase();
const isFlagged = (p: TargetPost) => p.category === "hate" || p.category === "offensive";

const categoryClass = (c: string | null) =>
  c === "hate"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : c === "offensive"
    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
    : c === "neutral"
    ? "bg-muted text-muted-foreground border-border"
    : "text-muted-foreground border-dashed";

function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  tone?: "default" | "danger" | "primary" | "warn";
}) {
  const toneClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "warn"
      ? "text-amber-500"
      : tone === "primary"
      ? "text-primary"
      : "text-foreground";
  return (
    <DashboardCard title={label} icon={Icon}>
      <div className={`text-3xl font-bold font-mono tabular-nums ${toneClass}`}>{value}</div>
      {sub && <p className="mt-1 text-xs leading-snug text-muted-foreground">{sub}</p>}
    </DashboardCard>
  );
}

export default function ApifyRecordsPage() {
  const [data, setData] = useState<ApifyOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const [targets, setTargets] = useState<MonitoringUser[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [items, setItems] = useState<TargetPost[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const load = useCallback(async () => {
    // finally, not a bare await: if either request rejects the page would
    // otherwise sit on its skeletons forever with no way to recover.
    try {
      const [overview, monitoring] = await Promise.all([
        api.getApifyStats(),
        api.getMonitoring(),
      ]);
      if (!overview.error) setData(overview);
      if (!monitoring.error) {
        setTargets(monitoring.data);
        // Open on the page of the most recent run. The first target in the list
        // is often a legacy account with nothing collected, which made this
        // panel open on an empty state even though other pages had content.
        const lastScraped = overview.error ? undefined : overview.runs[0]?.user_id;
        setSelectedTarget((cur) => cur ?? lastScraped ?? monitoring.data[0]?.id ?? null);
      }
    } catch (e) {
      console.error("Failed to load Apify records", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedTarget === null) return;
    let cancelled = false;
    setItemsLoading(true);
    api.getTargetPosts(selectedTarget).then((r) => {
      if (cancelled) return;
      setItems(r.error ? [] : r.data);
      setItemsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedTarget]);

  const anyActive = (data?.runs ?? []).some((r) => ACTIVE.has(r.status));

  // Poll only while a scrape is in flight, so the page moves on its own during a run.
  useEffect(() => {
    if (!anyActive) return;
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [anyActive, load]);

  const { posts, byPost, orphans } = useMemo(() => {
    const posts = items.filter((i) => i.kind === "post");
    const comments = items.filter((i) => i.kind === "comment");
    const keys = new Set(posts.map((p) => norm(p.url)));
    const byPost = new Map<string, TargetPost[]>();
    const orphans: TargetPost[] = [];
    for (const c of comments) {
      const k = norm(c.parent_url);
      if (k && keys.has(k)) byPost.set(k, [...(byPost.get(k) || []), c]);
      else orphans.push(c);
    }
    byPost.forEach((l) => l.sort((a, b) => Number(isFlagged(b)) - Number(isFlagged(a))));
    orphans.sort((a, b) => Number(isFlagged(b)) - Number(isFlagged(a)));
    return { posts, byPost, orphans };
  }, [items]);

  const totals = data?.totals;
  const cost = data?.cost;
  const cadence = data?.cadence;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Collection"
        icon={Database}
        title="Apify Records"
        description="Every collection run this system has made: what was scraped, how long it took, what it cost, and what the pipeline concluded about it."
      >
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </PageHeader>

      {anyActive && (
        <div className="relative flex items-center gap-3 overflow-hidden rounded-md border border-primary/40 bg-primary/5 p-4">
          <BorderBeam size={180} duration={8} />
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          <p className="text-sm">
            <strong className="text-primary">A collection run is in progress.</strong>{" "}
            <span className="text-muted-foreground">This page refreshes every five seconds while it runs.</span>
          </p>
        </div>
      )}

      {/* --- Volume --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[120px] w-full rounded-lg" />)
        ) : (
          <>
            <StatTile
              icon={FileText}
              label="Posts held"
              value={totals?.posts_stored ?? 0}
              sub={`${totals?.posts_collected ?? 0} scraped across ${totals?.runs ?? 0} run${totals?.runs === 1 ? "" : "s"} on ${targets.length} page${targets.length === 1 ? "" : "s"}; ${totals?.posts_stored ?? 0} kept after removing repeats.`}
            />
            <StatTile
              icon={MessageSquare}
              label="Comments held"
              value={totals?.comments_stored ?? 0}
              tone="primary"
              sub={`About ${totals?.comments_per_post ?? 0} per post — comments are where most hate speech appears.`}
            />
            <StatTile
              icon={Flag}
              label="Flagged for review"
              value={totals?.flagged ?? 0}
              tone="danger"
              sub={`${totals?.flag_rate ?? 0}% of everything collected. ${totals?.hate ?? 0} hate, ${totals?.offensive ?? 0} offensive.`}
            />
            <StatTile
              icon={Wallet}
              label="Estimated spend"
              value={usd(cost?.total_usd ?? 0)}
              tone="warn"
              sub={`${pkr(cost?.total_pkr ?? 0)} at ${cost?.pkr_per_usd ?? 0} PKR/USD. List-price estimate, not an invoice.`}
            />
          </>
        )}
      </div>

      {/* --- How often, and what it costs --- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Collection cadence" icon={Timer}>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 rounded border border-border/50 bg-background/40 p-2.5">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="text-xs text-muted-foreground">{cadence?.trigger}</p>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {[
                  ["Schedule", cadence?.scheduled ? "Automatic" : "On demand"],
                  ["Comments requested / post", String(cadence?.comments_requested_per_post ?? 0)],
                  ["Average run time", fmtDuration(cadence?.avg_run_seconds ?? null)],
                  ["Longest run", fmtDuration(cadence?.longest_run_seconds ?? null)],
                  ["Average gap between runs", fmtGap(cadence?.avg_gap_seconds ?? null)],
                  [
                    "Most recent run",
                    cadence?.last_run_at ? format(new Date(cadence.last_run_at), "dd MMM yyyy, HH:mm") : "—",
                  ],
                ].map(([k, v]) => (
                  <div key={k as string} className="min-w-0">
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
                    <dd className="truncate font-mono text-sm text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="border-t border-border/40 pt-2.5 text-xs text-muted-foreground">
                Runs are started by an officer from{" "}
                <a href="/user-monitoring" className="text-primary underline underline-offset-2">
                  User Monitoring
                </a>
                . Hourly automatic collection is supported by the scheduler but is deliberately left switched off
                until the Department approves a standing collection schedule.
              </p>
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Cost model" icon={Wallet}>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-3 text-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="pb-1.5 font-normal">Event</th>
                      <th className="pb-1.5 text-right font-normal">Unit price</th>
                      <th className="pb-1.5 text-right font-normal">Events billed</th>
                      <th className="pb-1.5 text-right font-normal">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono tabular-nums">
                    <tr className="border-b border-border/20">
                      <td className="py-1.5">Post scraped</td>
                      <td className="py-1.5 text-right">{usd(cost?.post_price_usd ?? 0)}</td>
                      <td className="py-1.5 text-right">{totals?.posts_collected ?? 0}</td>
                      <td className="py-1.5 text-right">
                        {usd((cost?.post_price_usd ?? 0) * (totals?.posts_collected ?? 0))}
                      </td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-1.5">Comment scraped</td>
                      <td className="py-1.5 text-right">{usd(cost?.comment_price_usd ?? 0)}</td>
                      <td className="py-1.5 text-right">{totals?.comments_collected ?? 0}</td>
                      <td className="py-1.5 text-right">
                        {usd((cost?.comment_price_usd ?? 0) * (totals?.comments_collected ?? 0))}
                      </td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-1.5">Actor start fee</td>
                      <td className="py-1.5 text-right">{usd(cost?.start_fee_usd ?? 0)}</td>
                      <td className="py-1.5 text-right">per run</td>
                      <td className="py-1.5 text-right text-muted-foreground">included</td>
                    </tr>
                    <tr className="font-semibold">
                      <td className="pt-2">Total to date</td>
                      <td />
                      <td />
                      <td className="pt-2 text-right text-amber-500">{usd(cost?.total_usd ?? 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border/40 pt-2.5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Cost per flagged case
                  </p>
                  <p className="font-mono text-sm">
                    {cost?.per_flagged_usd !== null && cost?.per_flagged_usd !== undefined
                      ? usd(cost.per_flagged_usd)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total in rupees
                  </p>
                  <p className="font-mono text-sm">{pkr(cost?.total_pkr ?? 0)}</p>
                </div>
              </div>
              <div className="space-y-1.5 rounded border border-dashed border-border/60 p-2 text-xs text-muted-foreground">
                <p>{cost?.basis}</p>
                <p>
                  Events billed counts everything Apify returned, including items seen in an earlier
                  run. Those repeats are charged again but are not stored twice, which is why the
                  billed figure is higher than the {totals?.posts_stored ?? 0} posts held.
                </p>
              </div>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* --- Run log --- */}
      <DashboardCard title="Run log" icon={Database} noPadding>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-mono text-xs uppercase tracking-wider">Page</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-wider">Posts</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-wider">Comments</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-wider">Flagged</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-wider">Duration</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-wider">Cost</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-wider">Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data && data.runs.length > 0 ? (
                data.runs.map((r: ApifyRun) => (
                  <TableRow key={r.id} className="border-border/40 hover:bg-muted/20">
                    <TableCell className="max-w-[220px]">
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-mono text-sm text-primary">{r.username}</span>
                        <span className="inline-flex items-center gap-1 truncate font-mono text-[10px] text-muted-foreground">
                          {r.district && r.district !== "Unknown" ? (
                            <>
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {r.district}
                            </>
                          ) : (
                            "District not assigned"
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-mono text-[10px] ${runStatusClass(r.status)}`}>
                        {r.status}
                      </Badge>
                      {r.error && (
                        <p className="mt-1 max-w-[220px] text-[10px] leading-snug text-destructive">{r.error}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">{r.posts}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">{r.comments}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      <span className={r.flagged > 0 ? "text-destructive" : "text-muted-foreground"}>{r.flagged}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                      {fmtDuration(r.duration_seconds)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-amber-500">
                      {usd(r.cost_usd)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-muted-foreground">
                      {r.started_at ? <TimeAgo date={new Date(r.started_at)} /> : "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                    No collection runs yet. Lock a page in User Monitoring and start one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>

      {/* --- Collected content, comments nested under their post --- */}
      <DashboardCard
        title="Collected content"
        description="Comments are shown underneath the post they were left on, so a post and its replies read as one item."
        icon={MessageSquare}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {targets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTarget(t.id)}
                className={`rounded border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  selectedTarget === t.id
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {t.username}
              </button>
            ))}
          </div>

          {itemsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
              Nothing collected from this page yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {posts.map((p) => {
                const comments = byPost.get(norm(p.url)) || [];
                const flaggedHere = comments.filter(isFlagged).length;
                return (
                  <li
                    key={p.id}
                    className={`space-y-2 rounded-md border p-3 ${
                      isFlagged(p) ? "border-destructive/40 bg-destructive/[0.03]" : "border-border/50 bg-card/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">Post</Badge>
                      <Badge variant="outline" className={`text-[10px] uppercase ${categoryClass(p.category)}`}>
                        {p.category ?? "not classified"}
                      </Badge>
                      {p.confidence !== null && (
                        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                          {Number(p.confidence).toFixed(1)}%
                        </span>
                      )}
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-primary"
                        >
                          source <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                    <p
                      className={`break-words text-sm leading-snug ${
                        isArabicScript(p.text) ? "urdu-text" : ""
                      }`}
                    >
                      {p.text}
                    </p>

                    {comments.length > 0 && (
                      <div className="border-t border-border/40 pt-2">
                        <p className="mb-1.5 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          {comments.length} comment{comments.length === 1 ? "" : "s"}
                          {flaggedHere > 0 && (
                            <span className="normal-case tracking-normal text-destructive">
                              {" "}· {flaggedHere} flagged
                            </span>
                          )}
                        </p>
                        <ul className="space-y-1.5 border-l-2 border-border/40 pl-3">
                          {comments.map((c) => (
                            <li
                              key={c.id}
                              className={`space-y-1 rounded border p-2 ${
                                isFlagged(c) ? "border-destructive/40 bg-destructive/5" : "border-border/40 bg-background/40"
                              }`}
                            >
                              <p className="break-words text-xs">
                                <span className="font-medium">{c.author || "Facebook user"}</span>{" "}
                                <span className={`text-foreground/90 ${isArabicScript(c.text) ? "urdu-text" : ""}`}>{c.text}</span>
                              </p>
                              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
                                <Badge variant="outline" className={`text-[10px] uppercase ${categoryClass(c.category)}`}>
                                  {c.category ?? "not classified"}
                                </Badge>
                                {c.confidence !== null && (
                                  <span className="tabular-nums">{Number(c.confidence).toFixed(1)}%</span>
                                )}
                                {c.language && <span>· {c.language}</span>}
                                {c.case_file_id !== null && (
                                  <a
                                    href="/review-queue"
                                    className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <Gavel className="h-3 w-3" />
                                    {c.review_status === "closed" ? "Decided" : "In review queue"}
                                  </a>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}

              {orphans.length > 0 && (
                <li className="space-y-2 rounded-md border border-border/50 bg-card/40 p-3">
                  <p className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <AlertTriangle className="h-3 w-3" />
                    Comments whose parent post is not in this collection ({orphans.length})
                  </p>
                  <ul className="space-y-1.5 border-l-2 border-border/40 pl-3">
                    {orphans.map((c) => (
                      <li
                        key={c.id}
                        className={`space-y-1 rounded border p-2 ${
                          isFlagged(c) ? "border-destructive/40 bg-destructive/5" : "border-border/40 bg-background/40"
                        }`}
                      >
                        <p className="break-words text-xs">
                          <span className="font-medium">{c.author || "Facebook user"}</span>{" "}
                          <span className={`text-foreground/90 ${isArabicScript(c.text) ? "urdu-text" : ""}`}>{c.text}</span>
                        </p>
                        <Badge variant="outline" className={`text-[10px] uppercase ${categoryClass(c.category)}`}>
                          {c.category ?? "not classified"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          )}
        </div>
      </DashboardCard>
    </div>
  );
}

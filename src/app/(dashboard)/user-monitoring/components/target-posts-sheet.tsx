"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, MapPin, History, FileText, Gavel } from "lucide-react";
import TimeAgo from "@/components/time-ago";
import { api, MonitoringUser, ScrapeRun, TargetPost } from "@/lib/api";

// logs.timestamp is SQLite CURRENT_TIMESTAMP, i.e. UTC without a zone marker.
const fromUtc = (ts: string) =>
  new Date(/[zZ]$|[+-]\d\d:?\d\d$/.test(ts) ? ts : ts.replace(" ", "T") + "Z");

const categoryClass = (c: string) =>
  c === "hate"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : c === "offensive"
    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
    : "bg-muted text-muted-foreground border-border";

const runClass = (s: string) =>
  s === "SUCCEEDED" ? "text-emerald-500 border-emerald-500/40"
  : s === "FAILED" ? "text-destructive border-destructive/40"
  : "text-primary border-primary/40";

type Props = {
  target: MonitoringUser;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function TargetPostsSheet({ target, isOpen, onOpenChange }: Props) {
  const [posts, setPosts] = useState<TargetPost[]>([]);
  const [runs, setRuns] = useState<ScrapeRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([api.getTargetPosts(target.id), api.getScrapeRuns(target.id)]).then(([p, r]) => {
      if (cancelled) return;
      setPosts(p.error ? [] : p.data);
      setRuns(r.error ? [] : r.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, target.id, target.last_scrape_at]);

  const counts = posts.reduce(
    (acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }),
    {} as Record<string, number>
  );
  const district = target.district && target.district !== "Unknown" ? target.district : null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-mono">{target.username}</SheetTitle>
          <SheetDescription asChild>
            <div className="flex flex-col gap-1 text-xs">
              {target.profile_url && (
                <a
                  href={target.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary"
                >
                  {target.profile_url.replace(/^https?:\/\/(www\.)?/, "")} <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {district ? `${district} district (assigned to this page)` : "No district assigned"}
              </span>
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="py-5 space-y-6">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              ["Posts", posts.length, "text-foreground"],
              ["Hate", counts.hate || 0, "text-destructive"],
              ["Offensive", counts.offensive || 0, "text-amber-500"],
              ["Neutral", counts.neutral || 0, "text-muted-foreground"],
            ].map(([label, value, cls]) => (
              <div key={label as string} className="rounded-md border bg-muted/20 py-2">
                <div className={`text-xl font-mono font-semibold tabular-nums ${cls}`}>{value as number}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label as string}</div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" /> Scraped posts
            </h3>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : posts.length === 0 ? (
              <p className="text-xs text-muted-foreground border border-dashed rounded-md p-4 text-center">
                Nothing scraped for this target yet. Use Scrape now from its menu.
              </p>
            ) : (
              <ul className="space-y-2">
                {posts.map((p) => (
                  <li key={p.id} className="rounded-md border bg-card/50 p-3 space-y-2">
                    <p className="text-sm leading-snug">{p.text}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted-foreground">
                      <Badge variant="outline" className={`uppercase text-[10px] ${categoryClass(p.category)}`}>
                        {p.category}
                      </Badge>
                      <span className="tabular-nums">{Number(p.confidence).toFixed(1)}%</span>
                      <span>· {p.language}</span>
                      <span>· <TimeAgo date={fromUtc(p.timestamp)} /></span>
                      {p.case_file_id !== null && (
                        <a href="/review-queue" className="ml-auto inline-flex items-center gap-1 text-primary hover:underline">
                          <Gavel className="h-3 w-3" />
                          {p.review_status === "closed" ? "Decided" : "In review queue"}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-muted-foreground" /> Apify runs
            </h3>
            {loading ? (
              <Skeleton className="h-12 w-full" />
            ) : runs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No scrapes run yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {runs.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className={`font-mono text-[10px] ${runClass(r.status)}`}>{r.status}</Badge>
                    <span className="text-muted-foreground">
                      {r.started_at ? <TimeAgo date={new Date(r.started_at)} /> : "—"}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {r.status === "FAILED"
                        ? r.error
                        : r.status === "SUCCEEDED"
                        ? `${r.posts} posts, ${r.flagged} flagged`
                        : "in progress"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

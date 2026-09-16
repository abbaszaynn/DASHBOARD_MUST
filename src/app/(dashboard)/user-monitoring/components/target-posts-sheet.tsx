"use client";

import { useEffect, useMemo, useState } from "react";
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
import { ExternalLink, MapPin, History, FileText, Gavel, MessageSquare } from "lucide-react";
import TimeAgo from "@/components/time-ago";
import { isArabicScript } from "@/lib/utils";
import { api, MonitoringUser, ScrapeRun, TargetPost } from "@/lib/api";

const categoryClass = (c: string | null) =>
  c === "hate"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : c === "offensive"
    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
    : c === "neutral"
    ? "bg-muted text-muted-foreground border-border"
    : "text-muted-foreground border-dashed";

const runClass = (s: string) =>
  s === "SUCCEEDED" ? "text-emerald-500 border-emerald-500/40"
  : s === "FAILED" ? "text-destructive border-destructive/40"
  : "text-primary border-primary/40";

const isFlagged = (p: TargetPost) => p.category === "hate" || p.category === "offensive";

// Post and comment URLs come back in slightly different shapes (query strings,
// trailing slashes), so compare them loosely when nesting comments under posts.
const norm = (u: string | null) => (u || "").split("?")[0].replace(/\/+$/, "").toLowerCase();

function ItemMeta({ p }: { p: TargetPost }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted-foreground">
      <Badge variant="outline" className={`uppercase text-[10px] ${categoryClass(p.category)}`}>
        {p.category ?? "not classified"}
      </Badge>
      {p.confidence !== null && <span className="tabular-nums">{Number(p.confidence).toFixed(1)}%</span>}
      {p.language && <span>· {p.language}</span>}
      <span>· <TimeAgo date={new Date(p.posted_at || p.created_at)} /></span>
      {p.url && (
        <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 hover:text-primary">
          · source <ExternalLink className="h-2.5 w-2.5" />
        </a>
      )}
      {p.case_file_id !== null && (
        <a href="/review-queue" className="ml-auto inline-flex items-center gap-1 text-primary hover:underline">
          <Gavel className="h-3 w-3" />
          {p.review_status === "closed" ? "Decided" : "In review queue"}
        </a>
      )}
    </div>
  );
}

function CommentRow({ c }: { c: TargetPost }) {
  return (
    <li className={`rounded border p-2 space-y-1.5 ${isFlagged(c) ? "border-destructive/40 bg-destructive/5" : "bg-background/40"}`}>
      <p className="text-xs">
        <span className="font-medium">{c.author || "Facebook user"}</span>{" "}
        <span className={`text-foreground/90 ${isArabicScript(c.text) ? "urdu-text" : ""}`}>{c.text}</span>
      </p>
      <ItemMeta p={c} />
    </li>
  );
}

type Props = {
  target: MonitoringUser;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function TargetPostsSheet({ target, isOpen, onOpenChange }: Props) {
  const [items, setItems] = useState<TargetPost[]>([]);
  const [runs, setRuns] = useState<ScrapeRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([api.getTargetPosts(target.id), api.getScrapeRuns(target.id)]).then(([p, r]) => {
      if (cancelled) return;
      setItems(p.error ? [] : p.data);
      setRuns(r.error ? [] : r.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, target.id, target.last_scrape_at]);

  const { posts, byPost, orphans, counts } = useMemo(() => {
    const posts = items.filter((i) => i.kind === "post");
    const comments = items.filter((i) => i.kind === "comment");
    const postKeys = new Set(posts.map((p) => norm(p.url)));
    const byPost = new Map<string, TargetPost[]>();
    const orphans: TargetPost[] = [];
    for (const c of comments) {
      const k = norm(c.parent_url);
      if (k && postKeys.has(k)) byPost.set(k, [...(byPost.get(k) || []), c]);
      else orphans.push(c);
    }
    // Flagged comments first under each post.
    byPost.forEach((list) => list.sort((a, b) => Number(isFlagged(b)) - Number(isFlagged(a))));
    orphans.sort((a, b) => Number(isFlagged(b)) - Number(isFlagged(a)));
    return {
      posts,
      byPost,
      orphans,
      counts: {
        posts: posts.length,
        comments: comments.length,
        hate: items.filter((i) => i.category === "hate").length,
        offensive: items.filter((i) => i.category === "offensive").length,
      },
    };
  }, [items]);

  const district = target.district && target.district !== "Unknown" ? target.district : null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
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
              ["Posts", counts.posts, "text-foreground"],
              ["Comments", counts.comments, "text-foreground"],
              ["Hate", counts.hate, "text-destructive"],
              ["Offensive", counts.offensive, "text-amber-500"],
            ].map(([label, value, cls]) => (
              <div key={label as string} className="rounded-md border bg-muted/20 py-2">
                <div className={`text-xl font-mono font-semibold tabular-nums ${cls}`}>{value as number}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label as string}</div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" /> Posts and their comments
            </h3>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : items.length === 0 ? (
              <p className="text-xs text-muted-foreground border border-dashed rounded-md p-4 text-center">
                Nothing scraped for this page yet. Use Scrape now from its menu.
              </p>
            ) : (
              <ul className="space-y-3">
                {posts.map((p) => {
                  const comments = byPost.get(norm(p.url)) || [];
                  const flaggedHere = comments.filter(isFlagged).length;
                  return (
                    <li key={p.id} className={`rounded-md border p-3 space-y-2 ${isFlagged(p) ? "border-destructive/40" : "bg-card/50"}`}>
                      <p className={`text-sm leading-snug ${isArabicScript(p.text) ? "urdu-text" : ""}`}>
                        {p.text}
                      </p>
                      <ItemMeta p={p} />
                      {comments.length > 0 && (
                        <div className="pt-2 border-t border-border/40">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 inline-flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> {comments.length} comment{comments.length === 1 ? "" : "s"}
                            {flaggedHere > 0 && <span className="text-destructive normal-case tracking-normal"> · {flaggedHere} flagged</span>}
                          </p>
                          <ul className="space-y-1.5">
                            {comments.map((c) => <CommentRow key={c.id} c={c} />)}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
                {orphans.length > 0 && (
                  <li className="rounded-md border p-3 space-y-2 bg-card/50">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Comments on this page&apos;s posts
                    </p>
                    <ul className="space-y-1.5">
                      {orphans.map((c) => <CommentRow key={c.id} c={c} />)}
                    </ul>
                  </li>
                )}
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
                    <span className="text-muted-foreground shrink-0">
                      {r.started_at ? <TimeAgo date={new Date(r.started_at)} /> : "—"}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {r.status === "FAILED"
                        ? r.error
                        : r.status === "SUCCEEDED"
                        ? `${r.posts} posts, ${r.comments ?? 0} comments, ${r.flagged} flagged`
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

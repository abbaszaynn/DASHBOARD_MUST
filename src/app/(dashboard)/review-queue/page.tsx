"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { ShieldAlert, Scale, Users, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { api, ReviewQueueItem } from "@/lib/api";
import ReviewQueueDetailsSheet from "./components/review-queue-details-sheet";

const categoryBadgeVariant = (category: string) => {
  switch (category?.toLowerCase()) {
    case "hate":
      return "destructive" as const;
    case "offensive":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

const priorityBadgeClass = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "medium":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export default function ReviewQueuePage() {
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReviewQueueItem | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const fetchQueue = useCallback(async (s: "open" | "closed") => {
    setLoading(true);
    try {
      const result = await api.getReviewQueue(s, { limit: 100 });
      if (!result.error) {
        setItems(result.data);
        setTotal(result.total);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue(status);
  }, [status, fetchQueue]);

  const handleRowClick = (item: ReviewQueueItem) => {
    setSelected(item);
    setSheetOpen(true);
  };

  const handleDecided = () => {
    fetchQueue(status);
  };

  return (
    <>
      <PageHeader
        title="Review Queue"
        description="Every flagged case lands here for human review before any action is taken — the pipeline never acts on its own."
      >
        <div className="flex items-center gap-2">
          <Button
            variant={status === "open" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatus("open")}
          >
            Open
          </Button>
          <Button
            variant={status === "closed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatus("closed")}
          >
            Decided
          </Button>
          <Button variant="ghost" size="icon" onClick={() => fetchQueue(status)} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Priority</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Legal Match</TableHead>
              <TableHead>Signals</TableHead>
              <TableHead>Reported</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                </TableRow>
              ))
            ) : items.length > 0 ? (
              items.map((item) => {
                const realMatches = item.legal_matches?.filter((m) => m.id !== "unmapped") ?? [];
                return (
                  <TableRow key={item.id} className="cursor-pointer" onClick={() => handleRowClick(item)}>
                    <TableCell>
                      <Badge variant="outline" className={priorityBadgeClass(item.priority)}>
                        {item.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-xs">{item.text}</TableCell>
                    <TableCell>
                      <Badge variant={categoryBadgeVariant(item.category)}>{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.confidence?.toFixed(0)}%</TableCell>
                    <TableCell>{item.platform}</TableCell>
                    <TableCell>
                      {realMatches.length > 0 ? (
                        <Badge variant="outline" className="gap-1">
                          <Scale className="h-3 w-3" /> {realMatches.length}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unmapped</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!!item.campaign_flag && (
                        <Badge variant="destructive" className="gap-1" title="Possible coordinated campaign">
                          <Users className="h-3 w-3" />
                        </Badge>
                      )}
                      {!!item.sarcasm_flag && (
                        <Badge variant="outline" className="gap-1 ml-1" title="Sarcasm heuristic flagged">
                          <ShieldAlert className="h-3 w-3" />
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(item.created_at), "PP p")}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No {status} cases in the review queue.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!loading && (
        <p className="text-xs text-muted-foreground mt-2">
          Showing {items.length} of {total} {status} case{total === 1 ? "" : "s"}.
        </p>
      )}

      {selected && (
        <ReviewQueueDetailsSheet
          item={selected}
          isOpen={isSheetOpen}
          onOpenChange={setSheetOpen}
          onDecided={handleDecided}
        />
      )}
    </>
  );
}

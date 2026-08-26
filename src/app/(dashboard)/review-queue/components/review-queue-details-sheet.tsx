"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReviewQueueItem } from "@/lib/api";
import { api } from "@/lib/api";
import { format } from "date-fns";
import {
  Scale,
  ShieldAlert,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Gavel,
  AlertTriangle,
  Info,
} from "lucide-react";

type Props = {
  item: ReviewQueueItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDecided: () => void;
};

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

export default function ReviewQueueDetailsSheet({ item, isOpen, onOpenChange, onDecided }: Props) {
  const [decidedBy, setDecidedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const isOpenStatus = item.status === "open";

  const handleDecision = async (decision: "confirm_violation" | "dismiss" | "escalate_external") => {
    setSubmitting(decision);
    setLocalError(null);
    try {
      const result = await api.decideReviewQueueItem(item.id, decision, decidedBy || "Anonymous Reviewer", notes);
      if (result.error) {
        setLocalError(result.message || "Failed to record decision.");
      } else {
        onDecided();
        onOpenChange(false);
      }
    } catch (e) {
      setLocalError("Failed to reach the backend.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" /> Case Review
          </SheetTitle>
          <SheetDescription>
            Every case here requires a human decision — no agent in this pipeline takes automatic
            enforcement action.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Flagged Content</h3>
            <p className="text-foreground bg-muted/30 p-3 rounded-md border">{item.text}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Category & Confidence</h3>
              <div className="flex items-center gap-2">
                <Badge variant={categoryBadgeVariant(item.category)} className="uppercase">
                  {item.category}
                </Badge>
                <span className="text-muted-foreground">{item.confidence?.toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Priority</h3>
              <Badge variant="outline" className={priorityBadgeClass(item.priority)}>
                {item.priority.toUpperCase()}
              </Badge>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Source</h3>
              <p>{item.platform} · {item.username}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">District</h3>
              <p className={item.district === "Unknown" ? "text-muted-foreground italic" : ""}>
                {item.district}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Reported</h3>
              <p>{format(new Date(item.created_at), "PPP p")}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">Status</h3>
              <Badge variant={isOpenStatus ? "outline" : "secondary"}>{item.status.toUpperCase()}</Badge>
            </div>
          </div>

          {item.cluster_id !== null && (
            <div className="flex items-center gap-2 text-sm bg-muted/30 p-3 rounded-md border">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                Part of cluster #{item.cluster_id}
                {!!item.campaign_flag && (
                  <Badge variant="destructive" className="ml-2">
                    <ShieldAlert className="h-3 w-3 mr-1" /> Possible coordinated campaign
                  </Badge>
                )}
              </span>
            </div>
          )}

          {item.sarcasm_score !== null && (
            <div className="flex items-start gap-2 text-sm bg-muted/30 p-3 rounded-md border">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p>
                  Sarcasm heuristic score: <span className="font-mono">{item.sarcasm_score}</span>{" "}
                  {!!item.sarcasm_flag && <Badge variant="outline" className="ml-1">flagged</Badge>}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rule-based placeholder, not a trained model — treat as a weak secondary signal only.
                </p>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Legal Grounding</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Assistive drafting aid for a human reviewer (ideally with legal training) to confirm —
              this is not an authoritative legal determination.
            </p>
            <div className="space-y-2">
              {item.legal_matches.map((match, idx) =>
                match.id === "unmapped" ? (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 text-sm"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-600 dark:text-amber-400">Not yet mapped</p>
                      <p className="text-muted-foreground text-xs mt-1">{match.notes}</p>
                    </div>
                  </div>
                ) : (
                  <div key={idx} className="p-3 rounded-md border bg-card/50 text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {match.law} — {match.section}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(match.confidence * 100)}% match
                      </Badge>
                    </div>
                    {match.title && <p className="text-muted-foreground">{match.title}</p>}
                    {match.jurisdiction && (
                      <p className="text-xs text-muted-foreground">Jurisdiction: {match.jurisdiction}</p>
                    )}
                    {match.matched_keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {match.matched_keywords.map((kw) => (
                          <Badge key={kw} variant="secondary" className="text-[10px]">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {isOpenStatus ? (
          <SheetFooter className="flex-col items-stretch gap-3 sm:flex-col mt-auto border-t pt-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="decided-by" className="text-xs text-muted-foreground">
                Reviewer name
              </Label>
              <Input
                id="decided-by"
                placeholder="Your name"
                value={decidedBy}
                onChange={(e) => setDecidedBy(e.target.value)}
              />
              <Label htmlFor="notes" className="text-xs text-muted-foreground mt-2">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add reasoning for this decision..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>
            {localError && <p className="text-sm text-destructive">{localError}</p>}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="destructive"
                onClick={() => handleDecision("confirm_violation")}
                disabled={!!submitting}
              >
                {submitting === "confirm_violation" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Confirm
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDecision("dismiss")}
                disabled={!!submitting}
              >
                {submitting === "dismiss" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" /> Dismiss
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDecision("escalate_external")}
                disabled={!!submitting}
              >
                {submitting === "escalate_external" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Gavel className="h-4 w-4 mr-1" /> Escalate
                  </>
                )}
              </Button>
            </div>
          </SheetFooter>
        ) : (
          <SheetFooter className="mt-auto border-t pt-4">
            <div className="w-full text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Decision:</span>{" "}
                <Badge variant="outline">{item.decision}</Badge>
              </p>
              {item.decided_by && (
                <p className="text-muted-foreground text-xs">
                  By {item.decided_by} on {item.decided_at ? format(new Date(item.decided_at), "PPP p") : "—"}
                </p>
              )}
              {item.decision_notes && <p className="text-xs text-muted-foreground">"{item.decision_notes}"</p>}
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

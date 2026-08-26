"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DashboardCard } from "@/components/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, AlertTriangle, BookOpen } from "lucide-react";
import { api, LegalMatch } from "@/lib/api";

export default function LegalFrameworkPage() {
  const [provisions, setProvisions] = useState<LegalMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await api.getLegalReference();
      if (!result.error) setProvisions(result.data);
      setLoading(false);
    })();
  }, []);

  const mapped = provisions.filter((p) => p.id !== "gb_local_unmapped" && (p.keywords?.length ?? 0) > 0);
  const unmapped = provisions.filter((p) => !mapped.includes(p));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Legal Framework"
        description="The reference table the Legal Mapping Agent matches flagged content against."
      />

      <DashboardCard title="How this works" icon={BookOpen}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When content is flagged, the pipeline checks its category and text against the keyword
          list for each provision below and attaches any matches to the case file for the
          reviewing officer. <strong className="text-foreground">This is an assistive drafting aid,
          not an authoritative legal determination</strong> — matches are keyword/pattern-based, not a
          substitute for review by a qualified legal officer, and every case still requires a human
          decision in the{" "}
          <a href="/review-queue" className="text-primary underline underline-offset-2">
            Review Queue
          </a>
          .
        </p>
      </DashboardCard>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mapped.map((p) => (
            <DashboardCard key={p.id} title={`${p.law} ${p.section ?? ""}`} icon={Scale}>
              <div className="space-y-3 text-sm">
                <p className="font-medium">{p.title}</p>
                {p.jurisdiction && (
                  <p className="text-xs text-muted-foreground">Jurisdiction: {p.jurisdiction}</p>
                )}
                {p.categories && p.categories.length > 0 && (
                  <div className="flex gap-1">
                    {p.categories.map((c) => (
                      <Badge key={c} variant="outline" className="text-[10px] uppercase">
                        {c}
                      </Badge>
                    ))}
                  </div>
                )}
                {p.keywords && p.keywords.length > 0 && (
                  <div className="pt-2 border-t border-border/40">
                    <p className="text-xs text-muted-foreground mb-1">Matching keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {p.keywords.map((kw) => (
                        <Badge key={kw} variant="secondary" className="text-[10px]">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DashboardCard>
          ))}

          {unmapped.map((p) => (
            <DashboardCard key={p.id} title={`${p.law} — ${p.section}`} icon={AlertTriangle}>
              <div className="p-3 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 text-sm">
                <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">Not yet mapped</p>
                <p className="text-muted-foreground text-xs">
                  {(p as any).notes ||
                    "No verified statute has been mapped for this jurisdiction. Do not fabricate a citation — cases touching this jurisdiction are marked unmapped and routed to human review as-is."}
                </p>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DashboardCard } from "@/components/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Network,
  AlertTriangle,
  Users,
  Layers,
  ChevronDown,
  ChevronRight,
  MapPin,
  Gavel,
  Workflow,
} from "lucide-react";
import { format } from "date-fns";
import { api, ContentCluster, ClusterConfig } from "@/lib/api";
import { isArabicScript } from "@/lib/utils";

const pct = (v: number | null) => (v === null ? "—" : `${(v * 100).toFixed(1)}%`);

export default function CampaignsPage() {
  const [clusters, setClusters] = useState<ContentCluster[]>([]);
  const [config, setConfig] = useState<ClusterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [onlyCampaigns, setOnlyCampaigns] = useState(false);

  useEffect(() => {
    api.getClusters().then((r) => {
      if (!r.error) {
        setClusters(r.data);
        setConfig(r.config);
      }
      setLoading(false);
    });
  }, []);

  const toggle = (id: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const stats = useMemo(() => {
    const campaigns = clusters.filter((c) => c.campaign_flag);
    return {
      clusters: clusters.length,
      campaigns: campaigns.length,
      largest: clusters.reduce((m, c) => Math.max(m, c.member_count), 0),
      grouped: clusters.reduce((s, c) => s + c.member_count, 0),
    };
  }, [clusters]);

  const shown = onlyCampaigns ? clusters.filter((c) => c.campaign_flag) : clusters;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analysis · Agent 04"
        icon={Network}
        title="Campaign Clustering"
        description="Groups near-identical posts and comments so that the same message pushed by many accounts is visible as one coordinated push rather than as unrelated items."
      >
        <Button
          variant={onlyCampaigns ? "default" : "outline"}
          size="sm"
          onClick={() => setOnlyCampaigns((v) => !v)}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Campaign flags only
        </Button>
      </PageHeader>

      <div className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div className="min-w-0 space-y-1 text-sm">
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            Simplified clustering — not a full ULTRA integration
          </p>
          <p className="text-muted-foreground">
            {config?.note ??
              "Items are compared one at a time against existing cluster centroids using multilingual sentence embeddings and cosine similarity. A campaign flag is a lead for an officer to verify, never a finding on its own."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Clusters" icon={Layers}>
          {loading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="text-3xl font-bold font-mono tabular-nums">{stats.clusters}</div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Distinct message groups found.</p>
        </DashboardCard>
        <DashboardCard title="Campaign flags" icon={AlertTriangle}>
          {loading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="text-3xl font-bold font-mono tabular-nums text-destructive">{stats.campaigns}</div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Reached {config?.campaign_min_members ?? 3}+ near-identical members.
          </p>
        </DashboardCard>
        <DashboardCard title="Largest cluster" icon={Users}>
          {loading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="text-3xl font-bold font-mono tabular-nums text-primary">{stats.largest}</div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Members in the biggest group.</p>
        </DashboardCard>
        <DashboardCard title="Items grouped" icon={Network}>
          {loading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="text-3xl font-bold font-mono tabular-nums">{stats.grouped}</div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Total items assigned to a cluster.</p>
        </DashboardCard>
      </div>

      <DashboardCard title="How a campaign is detected" icon={Workflow}>
        <ol className="grid gap-3 md:grid-cols-4">
          {[
            {
              n: "01",
              h: "Embed",
              b: `Each flagged item is converted to a multilingual sentence vector (${config?.embedding_model ?? "MiniLM"}), so wording differences don't hide a repeated message.`,
            },
            {
              n: "02",
              h: "Compare",
              b: `The vector is compared against every existing cluster centre. Above ${config?.similarity_threshold ?? 0.8} cosine similarity it joins that cluster.`,
            },
            {
              n: "03",
              h: "Group",
              b: "If nothing is close enough, it starts a new cluster. The cluster centre is then re-averaged to include the new item.",
            },
            {
              n: "04",
              h: "Flag",
              b: `Once a cluster reaches ${config?.campaign_min_members ?? 3} members it is marked a possible campaign and surfaced to an officer.`,
            },
          ].map((s) => (
            <li key={s.n} className="rounded-md border border-border/50 bg-background/40 p-3">
              <span className="font-mono text-[10px] tracking-widest text-primary">{s.n}</span>
              <h3 className="mt-1 text-sm font-semibold">{s.h}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.b}</p>
            </li>
          ))}
        </ol>
      </DashboardCard>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-md" />)
        ) : shown.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            {onlyCampaigns
              ? "No cluster has reached the campaign threshold yet."
              : "Nothing has been clustered yet. Clustering runs on flagged items above the medium confidence tier."}
          </div>
        ) : (
          shown.map((c) => {
            const isOpen = open.has(c.id);
            return (
              <div
                key={c.id}
                className={`overflow-hidden rounded-md border ${
                  c.campaign_flag ? "border-destructive/40 bg-destructive/[0.03]" : "border-border/50 bg-card/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/20"
                >
                  {isOpen ? (
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">CLUSTER #{c.id}</span>
                      {c.campaign_flag ? (
                        <Badge variant="destructive" className="gap-1 text-[10px]">
                          <AlertTriangle className="h-3 w-3" /> POSSIBLE CAMPAIGN
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Below threshold</Badge>
                      )}
                      <Badge variant="outline" className="gap-1 font-mono text-[10px]">
                        <Users className="h-3 w-3" /> {c.member_count} member{c.member_count === 1 ? "" : "s"}
                      </Badge>
                      {c.distinct_authors > 0 && (
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {c.distinct_authors} author{c.distinct_authors === 1 ? "" : "s"}
                        </Badge>
                      )}
                      {c.districts.map((d) => (
                        <Badge key={d} variant="outline" className="gap-1 font-mono text-[10px]">
                          <MapPin className="h-3 w-3" /> {d}
                        </Badge>
                      ))}
                    </div>
                    <p
                      className={`break-words text-sm leading-snug text-foreground/90 ${
                        isArabicScript(c.representative_text) ? "urdu-text" : ""
                      }`}
                    >
                      {c.representative_text}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      First seen {format(new Date(c.created_at), "dd MMM yyyy, HH:mm")} · last updated{" "}
                      {format(new Date(c.updated_at), "dd MMM yyyy, HH:mm")}
                    </p>
                  </div>
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-border/40 bg-background/40 p-4">
                    <div>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Members ({c.members.length}) — similarity to cluster centre
                      </p>
                      <ul className="space-y-1.5">
                        {c.members.map((m) => (
                          <li
                            key={m.id}
                            className="flex flex-wrap items-start justify-between gap-2 rounded border border-border/40 bg-card/40 p-2"
                          >
                            <span
                              className={`min-w-0 flex-1 break-words text-xs ${
                                isArabicScript(m.text) ? "urdu-text" : ""
                              }`}
                            >
                              {m.text}
                            </span>
                            <span className="shrink-0 font-mono text-[10px] tabular-nums text-primary">
                              {pct(m.similarity_to_centroid)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {c.cases.length > 0 && (
                      <div>
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Linked case files ({c.cases.length})
                        </p>
                        <ul className="space-y-1.5">
                          {c.cases.map((cs) => (
                            <li
                              key={cs.id}
                              className="flex flex-wrap items-center gap-2 rounded border border-border/40 bg-card/40 p-2 text-xs"
                            >
                              <span className="font-mono text-muted-foreground">#{cs.id}</span>
                              <span className="font-medium">{cs.username ?? "Unknown author"}</span>
                              <Badge
                                variant={cs.category === "hate" ? "destructive" : "secondary"}
                                className="text-[10px] uppercase"
                              >
                                {cs.category ?? "—"}
                              </Badge>
                              {cs.confidence !== null && (
                                <span className="font-mono tabular-nums text-muted-foreground">
                                  {cs.confidence.toFixed(0)}%
                                </span>
                              )}
                              <a
                                href="/review-queue"
                                className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
                              >
                                <Gavel className="h-3 w-3" />
                                {cs.review_status === "closed" ? "Decided" : "In review queue"}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

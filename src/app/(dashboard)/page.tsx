"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/page-header";
import { DashboardCard } from "@/components/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Home,
  Database,
  Flag,
  Gavel,
  Network,
  ShieldCheck,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";

// Kept out of the initial bundle: neither panel is needed to render the summary.
const AiAnalyzer = dynamic(() => import("@/components/dashboard/ai-analyzer"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-border/50 bg-card p-6">
      <Skeleton className="h-40 w-full" />
    </div>
  ),
});
const LiveFeed = dynamic(
  () => import("@/components/dashboard/live-feed").then((m) => ({ default: m.LiveFeed })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-border/50 bg-card p-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    ),
  }
);

const chartConfigCategory = {
  Hate: { label: "Hate", color: "hsl(var(--chart-5))" },
  Offensive: { label: "Offensive", color: "hsl(var(--chart-4))" },
  Neutral: { label: "Neutral", color: "hsl(var(--chart-2))" },
};

const chartConfigPlatform = { value: { label: "Flagged", color: "hsl(var(--chart-1))" } };

// What each stage of the pipeline can actually be relied on for today. These
// states are the same ones declared to the Department in the proposal - the
// dashboard must not imply a maturity the system does not have.
type AgentCard = {
  n: string;
  name: string;
  state: string;
  note: string;
  tone: "ok" | "warn" | "crit";
  href?: string;
};

const AGENTS: AgentCard[] = [
  { n: "01", name: "Ingestion", state: "Operational", note: "Licensed provider, public content only", tone: "ok" },
  { n: "02", name: "Classification", state: "Operational", note: "Not yet validated on GB dialects", tone: "ok" },
  { n: "03", name: "Sarcasm", state: "Placeholder", note: "Rule-based, English markers only", tone: "crit", href: "/sarcasm" },
  { n: "04", name: "Clustering", state: "Simplified", note: "Embeddings + cosine, not full ULTRA", tone: "warn", href: "/campaigns" },
  { n: "05", name: "Legal mapping", state: "Needs validation", note: "Requires advocate sign-off", tone: "warn", href: "/legal-framework" },
  { n: "06", name: "Human review", state: "Enforced", note: "Database constraint, cannot be bypassed", tone: "ok", href: "/review-queue" },
];

const toneClass = (t: string) =>
  t === "ok"
    ? "text-emerald-500 border-emerald-500/40"
    : t === "warn"
    ? "text-amber-500 border-amber-500/40"
    : "text-destructive border-destructive/40";

export default function CommandCenterPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ hate: 0, offensive: 0, neutral: 0, total: 0 });
  const [collected, setCollected] = useState({ items: 0, posts: 0, comments: 0, costUsd: 0 });
  const [openCases, setOpenCases] = useState(0);
  const [campaigns, setCampaigns] = useState(0);
  const [targets, setTargets] = useState(0);
  const [platformData, setPlatformData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [trends, platforms, apify, clusters, queue, monitoring] = await Promise.all([
          api.getTrends(),
          api.getPlatformStats(),
          api.getApifyStats(),
          api.getClusters(),
          api.getReviewQueue("open", { limit: 1 }),
          api.getMonitoring(),
        ]);
        if (!trends.error) setStats(trends.stats);
        if (!platforms.error) {
          setPlatformData(
            platforms.data.map((p) => ({ name: p.platform, value: p.hate + p.offensive }))
          );
        }
        if (!apify.error) {
          setCollected({
            items: apify.totals.items_stored,
            posts: apify.totals.posts_stored,
            comments: apify.totals.comments_stored,
            costUsd: apify.cost.total_usd,
          });
        }
        if (!clusters.error) setCampaigns(clusters.data.filter((c) => c.campaign_flag).length);
        if (!queue.error) setOpenCases(queue.total);
        if (!monitoring.error) setTargets(monitoring.data.length);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryBreakdown = [
    { name: "Hate", value: stats.hate, fill: "hsl(var(--chart-5))" },
    { name: "Offensive", value: stats.offensive, fill: "hsl(var(--chart-4))" },
    { name: "Neutral", value: stats.neutral, fill: "hsl(var(--chart-2))" },
  ];

  const tiles = [
    {
      label: "Collected",
      value: collected.items,
      sub: `${collected.posts} posts and ${collected.comments} comments from ${targets} monitored page${targets === 1 ? "" : "s"}.`,
      icon: Database,
      tone: "text-foreground",
      href: "/apify-records",
    },
    {
      label: "Flagged by the model",
      value: stats.hate + stats.offensive,
      sub: `${stats.hate} hate, ${stats.offensive} offensive, out of ${stats.total} analysed.`,
      icon: Flag,
      tone: "text-destructive",
      href: "/review-queue",
    },
    {
      label: "Awaiting an officer",
      value: openCases,
      sub: "Open cases. Nothing leaves this queue without a human decision.",
      icon: Gavel,
      tone: "text-amber-500",
      href: "/review-queue",
    },
    {
      label: "Possible campaigns",
      value: campaigns,
      sub: "Groups of near-identical posts, for an officer to verify.",
      icon: Network,
      tone: "text-primary",
      href: "/campaigns",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        icon={Home}
        title="Command Center"
        description="Current state of the monitoring pipeline for Gilgit-Baltistan: what has been collected, what the model flagged, and what is waiting on a human decision."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <a key={t.label} href={t.href} className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <DashboardCard title={t.label} icon={t.icon} className="h-full transition-colors group-hover:border-primary/40">
              {loading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <div className={`text-3xl font-bold font-mono tabular-nums ${t.tone}`}>
                  {t.value.toLocaleString()}
                </div>
              )}
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{t.sub}</p>
            </DashboardCard>
          </a>
        ))}
      </div>

      {/* The pipeline's own maturity, stated on the landing page rather than
          buried - a reviewer should not have to dig to find what is a placeholder. */}
      <DashboardCard
        title="Pipeline status"
        description="Six agents. Every path ends at human review."
        icon={ShieldCheck}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {AGENTS.map((a) => {
            const body = (
              <div className="h-full rounded-md border border-border/50 bg-background/40 p-3 transition-colors hover:border-primary/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] tracking-widest text-primary">{a.n}</span>
                  <Badge variant="outline" className={`font-mono text-[9px] uppercase ${toneClass(a.tone)}`}>
                    {a.state}
                  </Badge>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold">{a.name}</h3>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{a.note}</p>
              </div>
            );
            return a.href ? (
              <a key={a.n} href={a.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {body}
              </a>
            ) : (
              <div key={a.n}>{body}</div>
            );
          })}
        </div>
      </DashboardCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <DashboardCard
              title="Category breakdown"
              description="Every item the classifier has processed"
              icon={AlertTriangle}
            >
              {loading ? (
                <Skeleton className="h-[220px] w-full" />
              ) : stats.total > 0 ? (
                <ChartContainer config={chartConfigCategory} className="h-[220px] w-full">
                  <BarChart data={categoryBreakdown} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: "hsl(var(--muted)/0.2)" }} content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={48}>
                      {categoryBreakdown.map((e) => (
                        <Cell key={e.name} fill={e.fill} />
                      ))}
                      <LabelList dataKey="value" position="top" offset={8} className="fill-foreground font-mono" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-xs italic text-muted-foreground">
                  Nothing analysed yet.
                </div>
              )}
            </DashboardCard>

            <DashboardCard
              title="Flagged by platform"
              description="Where flagged content came from"
              icon={BarChart3}
            >
              {loading ? (
                <Skeleton className="h-[220px] w-full" />
              ) : platformData.length > 0 ? (
                <ChartContainer config={chartConfigPlatform} className="h-[220px] w-full">
                  <BarChart data={platformData} layout="vertical" margin={{ left: 0, right: 24 }}>
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={72} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <XAxis type="number" hide />
                    <Tooltip cursor={{ fill: "hsl(var(--muted)/0.2)" }} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="value" radius={2} barSize={22}>
                      {platformData.map((_, i) => (
                        <Cell key={i} fill={["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"][i % 4]} />
                      ))}
                      <LabelList dataKey="value" position="right" offset={8} className="fill-foreground font-mono" fontSize={10} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-xs italic text-muted-foreground">
                  No flagged content yet.
                </div>
              )}
            </DashboardCard>
          </div>

          <DashboardCard title="Collection to date" icon={Wallet}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* a div, not a p: Skeleton renders a div, and a div inside a p is
                  invalid HTML that React reports as a hydration failure. */}
              <div className="min-w-0 max-w-xl text-sm text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-4 w-80" />
                ) : (
                  <>
                    {collected.items.toLocaleString()} items collected for an estimated{" "}
                    <span className="font-mono text-foreground">${collected.costUsd.toFixed(4)}</span> at
                    Apify list prices. Full run history, cadence and the cost model are on the Apify
                    Records page.
                  </>
                )}
              </div>
              <a
                href="/apify-records"
                className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
              >
                Open Apify Records <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <AiAnalyzer />
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}

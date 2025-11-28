"use client"

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, Flag, ShieldAlert, TrendingUp, BarChart3, Activity, Radio, AlertTriangle } from "lucide-react";
import type { FlaggedPost } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import AiAnalyzer from "@/components/dashboard/ai-analyzer";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis, LabelList, Cell, Area, AreaChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { weeklyTrends, platformSources } from "@/lib/data";
import TimeAgo from "@/components/time-ago";
import { DashboardCard } from "@/components/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, TrendStats, MonitoringUser, FlaggedItem } from "@/lib/api";

const chartConfigWeekly = {
  Hate: { label: "Hate", color: "hsl(var(--chart-5))" },
  Offensive: { label: "Offensive", color: "hsl(var(--chart-4))" },
};

const chartConfigPlatform = {
  value: { label: "Count", color: "hsl(var(--chart-1))" },
  Facebook: { label: "Facebook", color: "hsl(var(--chart-1))" },
  Web: { label: "Web", color: "hsl(var(--chart-2))" },
  Twitter: { label: "Twitter", color: "hsl(var(--chart-3))" },
  Instagram: { label: "Instagram", color: "hsl(var(--chart-4))" },
};

const chartConfigCategory = {
  Hate: { label: "Hate", color: "hsl(var(--chart-5))" },
  Offensive: { label: "Offensive", color: "hsl(var(--chart-4))" },
  Neutral: { label: "Neutral", color: "hsl(var(--chart-2))" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<TrendStats | null>(null);
  const [monitoringUsers, setMonitoringUsers] = useState<MonitoringUser[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendsData, monitoringData, flaggedData] = await Promise.all([
          api.getTrends(),
          api.getMonitoring(),
          api.getFlagged()
        ]);

        if (!trendsData.error) setStats(trendsData.stats);
        if (!monitoringData.error) setMonitoringUsers(monitoringData.data);
        if (!flaggedData.error) setFlaggedPosts(flaggedData.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPostsAnalyzed = stats?.total || 0;
  const totalFlaggedCount = (stats?.hate || 0) + (stats?.offensive || 0);
  const hateSpeechCount = stats?.hate || 0;
  const offensiveSpeechCount = stats?.offensive || 0;
  const monitoredUsersCount = monitoringUsers.length;
  const neutralCount = stats?.neutral || 0;

  const categoryBreakdown = [
    { name: 'Hate', value: hateSpeechCount, fill: 'hsl(var(--chart-5))' },
    { name: 'Offensive', value: offensiveSpeechCount, fill: 'hsl(var(--chart-4))' },
    { name: 'Neutral', value: neutralCount, fill: 'hsl(var(--chart-2))' },
  ];


  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Analyzed" icon={Activity}>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {totalPostsAnalyzed.toLocaleString()}
            </div>
            <span className="text-xs text-emerald-500 font-medium">+12%</span>
          </div>
          <div className="mt-2 h-1 w-full bg-secondary overflow-hidden rounded-full">
            <div className="h-full bg-primary w-[70%] animate-pulse" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-mono uppercase">System Load: Normal</p>
        </DashboardCard>

        <DashboardCard title="Threats Detected" icon={ShieldAlert}>
          <div className="flex items-baseline gap-2">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold font-mono text-destructive">{hateSpeechCount}</div>}
            <span className="text-xs text-destructive font-medium">CRITICAL</span>
          </div>
          <div className="mt-2 h-1 w-full bg-secondary overflow-hidden rounded-full">
            <div className="h-full bg-destructive w-[45%]" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-mono uppercase">Action Required</p>
        </DashboardCard>

        <DashboardCard title="Flagged Content" icon={Flag}>
          <div className="flex items-baseline gap-2">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold font-mono text-amber-500">{totalFlaggedCount}</div>}
            <span className="text-xs text-amber-500 font-medium">WARNING</span>
          </div>
          <div className="mt-2 h-1 w-full bg-secondary overflow-hidden rounded-full">
            <div className="h-full bg-amber-500 w-[30%]" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-mono uppercase">Hate & Offensive</p>
        </DashboardCard>

        <DashboardCard title="Active Targets" icon={Users}>
          <div className="flex items-baseline gap-2">
            {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-3xl font-bold font-mono text-primary">{monitoredUsersCount}</div>}
            <span className="text-xs text-primary font-medium">MONITORING</span>
          </div>
          <div className="mt-2 h-1 w-full bg-secondary overflow-hidden rounded-full">
            <div className="h-full bg-primary w-[80%]" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-mono uppercase">Profiles Tracked</p>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Weekly Threat Volume" icon={TrendingUp} className="h-[400px]">
            <ChartContainer config={chartConfigWeekly} className="h-[320px] w-full">
              <AreaChart data={weeklyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOffensive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area type="monotone" dataKey="Hate" stroke="hsl(var(--chart-5))" fillOpacity={1} fill="url(#colorHate)" strokeWidth={2} />
                <Area type="monotone" dataKey="Offensive" stroke="hsl(var(--chart-4))" fillOpacity={1} fill="url(#colorOffensive)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </DashboardCard>

          <div className="grid md:grid-cols-2 gap-6">
            <DashboardCard title="Platform Distribution" icon={BarChart3}>
              <ChartContainer config={chartConfigPlatform} className="h-[200px] w-full">
                <BarChart data={platformSources} layout="vertical" margin={{ left: 0, right: 0 }}>
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={70} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <XAxis type="number" hide />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.2)' }} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="value" radius={2} barSize={20}>
                    {platformSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[
                        'hsl(var(--chart-1))',
                        'hsl(var(--chart-2))',
                        'hsl(var(--chart-3))',
                        'hsl(var(--chart-4))'
                      ][index % 4]} />
                    ))}
                    <LabelList dataKey="value" position="right" offset={8} className="fill-foreground font-mono" fontSize={10} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </DashboardCard>

            <DashboardCard title="Category Breakdown" icon={AlertTriangle}>
              <ChartContainer config={chartConfigCategory} className="h-[200px] w-full">
                <BarChart data={categoryBreakdown} margin={{ top: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.2)' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </DashboardCard>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <AiAnalyzer />

          <DashboardCard title="Live Feed" icon={Radio} className="h-[500px] flex flex-col" noPadding>
            <div className="p-4 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase">Real-time Interception</span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-red-500">LIVE</span>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="divide-y divide-border/30">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))
                ) : flaggedPosts && flaggedPosts.length > 0 ? (
                  flaggedPosts.map((post: FlaggedItem) => (
                    <div key={post.id} className="p-4 hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-primary font-mono">User #{post.id}</span>
                        <span className="text-[10px] text-muted-foreground font-mono"><TimeAgo date={post.timestamp} /></span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 group-hover:text-foreground transition-colors">
                        {post.text}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 rounded-sm border-0 ${post.category === "hate" ? "bg-destructive/10 text-destructive" :
                          post.category === "offensive" ? "bg-amber-500/10 text-amber-500" : "bg-secondary text-secondary-foreground"
                          }`}>
                          {post.category.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          CONF: <span className={post.confidence > 80 ? "text-destructive" : "text-amber-500"}>{(post.confidence).toFixed(0)}%</span>
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No active threats detected in current window.
                  </div>
                )}
              </div>
            </ScrollArea>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

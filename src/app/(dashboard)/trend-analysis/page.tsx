"use client"

import { weeklyTrends, hotKeywords, flaggedPosts, users } from "@/lib/data";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis, LabelList, Cell, Area, AreaChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { suggestKeywordsHashtags, SuggestKeywordsHashtagsOutput } from "@/ai/flows/suggest-keywords-hashtags";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, Flame, Map, TrendingUp, Globe, Share2, ArrowRight, Scale, Users as UsersIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import KeywordUsersDialog from "./components/keyword-users-dialog";
import type { User, FlaggedPost } from "@/types";
import { DashboardCard } from "@/components/dashboard-card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const chartConfigWeekly = {
    Hate: { label: "Hate", color: "hsl(var(--chart-5))" },
    Offensive: { label: "Offensive", color: "hsl(var(--chart-4))" },
};

const chartConfigRegional = {
    value: { label: "Count", color: "hsl(var(--chart-1))" },
};

const chartConfigPlatform = {
    value: { label: "Count", color: "hsl(var(--chart-2))" },
    Facebook: { label: "Facebook", color: "hsl(var(--chart-1))" },
    Web: { label: "Web", color: "hsl(var(--chart-2))" },
    Twitter: { label: "Twitter", color: "hsl(var(--chart-3))" },
    Instagram: { label: "Instagram", color: "hsl(var(--chart-4))" },
};

const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
];

type UserWithPosts = {
    user: User;
    posts: Pick<FlaggedPost, 'id' | 'content'>[];
};

import { api, ProcessResponse, DistrictStat, PlatformStat } from "@/lib/api";

type ChartDatum = { name: string; value: number };

export default function TrendAnalysisPage() {
    const [currentTrends, setCurrentTrends] = useState("");
    const [flaggedSummary, setFlaggedSummary] = useState("");
    const [suggestions, setSuggestions] = useState<SuggestKeywordsHashtagsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [keywordUsers, setKeywordUsers] = useState<UserWithPosts[]>([]);
    const [compareMode, setCompareMode] = useState(false);

    // Content Classifier State
    const [analysisText, setAnalysisText] = useState("");
    const [analysisResult, setAnalysisResult] = useState<ProcessResponse | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Live district/platform stats (replaces hardcoded mock arrays)
    const [districtData, setDistrictData] = useState<ChartDatum[]>([]);
    const [platformData, setPlatformData] = useState<ChartDatum[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [districtsAllUnknown, setDistrictsAllUnknown] = useState(false);

    useEffect(() => {
        (async () => {
            const [districtRes, platformRes] = await Promise.all([
                api.getDistrictStats(),
                api.getPlatformStats(),
            ]);
            if (!districtRes.error) {
                const rows = districtRes.data;
                setDistrictsAllUnknown(rows.length > 0 && rows.every((r) => r.district === "Unknown"));
                setDistrictData(rows.map((r: DistrictStat) => ({ name: r.district, value: r.hate + r.offensive })));
            }
            if (!platformRes.error) {
                setPlatformData(platformRes.data.map((r: PlatformStat) => ({ name: r.platform, value: r.hate + r.offensive })));
            }
            setStatsLoading(false);
        })();
    }, []);

    const handleAnalyze = async () => {
        if (!analysisText) return;
        setIsAnalyzing(true);
        try {
            const result = await api.process(analysisText);
            setAnalysisResult(result);
        } catch (error) {
            console.error("Analysis failed:", error);
        }
        setIsAnalyzing(false);
    };

    const handleGetSuggestions = async () => {
        setIsLoading(true);
        setSuggestions(null);
        try {
            const result = await suggestKeywordsHashtags({
                currentTrends,
                flaggedContentSummary: flaggedSummary,
            });
            setSuggestions(result);
        } catch (error) {
            console.error("AI suggestion failed:", error);
        }
        setIsLoading(false);
    }

    const getUsersForKeyword = (keyword: string): UserWithPosts[] => {
        if (!keyword) return [];

        const relevantPosts = flaggedPosts.filter(post =>
            post.content.toLowerCase().includes(keyword.toLowerCase())
        );

        const usersWithPosts = new Map<string, { user: User; posts: Pick<FlaggedPost, 'id' | 'content'>[] }>();

        relevantPosts.forEach(post => {
            const fullUser = users.find(u => u.name === post.user.name);
            if (fullUser) {
                if (!usersWithPosts.has(fullUser.id)) {
                    usersWithPosts.set(fullUser.id, { user: fullUser, posts: [] });
                }
                usersWithPosts.get(fullUser.id)!.posts.push({ id: post.id, content: post.content });
            }
        });

        return Array.from(usersWithPosts.values());
    }

    const handleKeywordClick = (keyword: string) => {
        setSelectedKeyword(keyword);
        setKeywordUsers(getUsersForKeyword(keyword));
        setDialogOpen(true);
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight uppercase font-mono">Trend Analysis</h1>
                <div className="flex items-center space-x-2 bg-card/50 p-2 rounded-md border border-border/50">
                    <Switch id="compare-mode" checked={compareMode} onCheckedChange={setCompareMode} />
                    <Label htmlFor="compare-mode" className="text-xs font-mono text-muted-foreground">COMPARE PREV. PERIOD</Label>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DashboardCard title="Weekly Threat Volume" icon={TrendingUp}>
                        <ChartContainer config={chartConfigWeekly} className="h-[300px] w-full">
                            <AreaChart data={weeklyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHateTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOffensiveTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                                <Area type="monotone" dataKey="Hate" stroke="hsl(var(--chart-5))" fillOpacity={1} fill="url(#colorHateTrend)" strokeWidth={2} />
                                <Area type="monotone" dataKey="Offensive" stroke="hsl(var(--chart-4))" fillOpacity={1} fill="url(#colorOffensiveTrend)" strokeWidth={2} />
                                {compareMode && (
                                    <Area type="monotone" dataKey="Hate" stroke="hsl(var(--chart-5))" strokeDasharray="5 5" fill="transparent" strokeOpacity={0.5} strokeWidth={1} />
                                )}
                            </AreaChart>
                        </ChartContainer>
                    </DashboardCard>

                    <div className="grid md:grid-cols-2 gap-6">
                        <DashboardCard title="Regional Breakdown" icon={Map}>
                            {statsLoading ? (
                                <Skeleton className="h-[250px] w-full" />
                            ) : districtData.length > 0 ? (
                                <>
                                    <ChartContainer config={chartConfigRegional} className="h-[250px] w-full">
                                        <BarChart data={districtData} layout="vertical" margin={{ left: 0, right: 20 }}>
                                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                                            <XAxis type="number" hide />
                                            <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.2)' }} content={<ChartTooltipContent hideLabel />} />
                                            <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={2} barSize={24}>
                                                <LabelList dataKey="value" position="right" offset={8} className="fill-foreground font-mono" fontSize={10} />
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                    {districtsAllUnknown && (
                                        <p className="text-[10px] text-muted-foreground mt-2 italic">
                                            District tagging isn't available for ingested content yet — all flagged items are grouped as "Unknown" until source data includes location metadata.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground italic">
                                    No flagged content processed yet.
                                </div>
                            )}
                        </DashboardCard>

                        <DashboardCard title="Platform Sources" icon={Share2}>
                            {statsLoading ? (
                                <Skeleton className="h-[250px] w-full" />
                            ) : platformData.length > 0 ? (
                                <ChartContainer config={chartConfigPlatform} className="h-[250px] w-full">
                                    <BarChart data={platformData} margin={{ top: 20 }}>
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                                        <YAxis hide />
                                        <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.2)' }} content={<ChartTooltipContent />} />
                                        <Bar dataKey="value" radius={4}>
                                            {platformData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                            ))}
                                            <LabelList dataKey="value" position="top" offset={8} className="fill-foreground font-mono" fontSize={10} />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground italic">
                                    No flagged content processed yet.
                                </div>
                            )}
                        </DashboardCard>
                    </div>
                </div>

                <div className="space-y-6">
                    <DashboardCard title="Hot Keywords" icon={Flame}>
                        <div className="flex flex-wrap gap-2">
                            {hotKeywords.map(keyword => (
                                <Button
                                    key={keyword}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleKeywordClick(keyword)}
                                    className="text-xs border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    {keyword}
                                </Button>
                            ))}
                        </div>
                    </DashboardCard>

                    <DashboardCard title="AI Intelligence" icon={Bot}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-mono text-muted-foreground">CURRENT TRENDS CONTEXT</Label>
                                <Textarea
                                    placeholder="Describe current trending topics..."
                                    value={currentTrends}
                                    onChange={(e) => setCurrentTrends(e.target.value)}
                                    className="bg-background/50 border-border/50 text-xs resize-none focus-visible:ring-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-mono text-muted-foreground">FLAGGED CONTENT SUMMARY</Label>
                                <Textarea
                                    placeholder="Provide a summary of recently flagged content..."
                                    value={flaggedSummary}
                                    onChange={(e) => setFlaggedSummary(e.target.value)}
                                    className="bg-background/50 border-border/50 text-xs resize-none focus-visible:ring-primary/50"
                                />
                            </div>
                            <Button
                                onClick={handleGetSuggestions}
                                disabled={isLoading || !currentTrends || !flaggedSummary}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                                Generate Intel
                            </Button>

                            {isLoading && (
                                <div className="space-y-3 pt-4 animate-pulse">
                                    <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                                    <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                                </div>
                            )}

                            {suggestions && (
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <div>
                                        <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Suggested Keywords</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.keywords.map(kw => (
                                                <Badge key={kw} variant="secondary" className="bg-secondary/50 text-secondary-foreground border-0">{kw}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Suggested Hashtags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.hashtags.map(ht => (
                                                <Badge key={ht} variant="outline" className="border-primary/30 text-primary">{ht}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Content Classifier" icon={Bot}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-mono text-muted-foreground">TEXT ANALYSIS</Label>
                                <Textarea
                                    placeholder="Enter text to analyze for hate speech..."
                                    value={analysisText}
                                    onChange={(e) => setAnalysisText(e.target.value)}
                                    className="bg-background/50 border-border/50 text-xs resize-none focus-visible:ring-primary/50"
                                />
                            </div>
                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !analysisText}
                                className="w-full"
                                variant="secondary"
                            >
                                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Analyze Content"}
                            </Button>

                            {analysisResult && !analysisResult.error && (
                                <div className="p-4 bg-muted/30 rounded-md space-y-3 border border-border/50 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono text-muted-foreground">CATEGORY</span>
                                        <Badge variant={analysisResult.category === 'neutral' ? 'secondary' : 'destructive'} className="uppercase">
                                            {analysisResult.category}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono text-muted-foreground">CONFIDENCE</span>
                                        <span className={`text-xs font-bold font-mono ${(analysisResult.confidence ?? 0) > 80 ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {analysisResult.confidence}%
                                        </span>
                                    </div>
                                    {analysisResult.requires_human_review && (
                                        <>
                                            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                                                <Badge variant="outline" className="uppercase text-[10px]">{analysisResult.final_tier} tier</Badge>
                                                {analysisResult.cluster?.campaign_flag && (
                                                    <Badge variant="destructive" className="gap-1 text-[10px]">
                                                        <UsersIcon className="h-3 w-3" /> Campaign
                                                    </Badge>
                                                )}
                                            </div>
                                            {analysisResult.legal_matches && analysisResult.legal_matches.length > 0 && (
                                                <div className="pt-2 border-t border-border/30 space-y-1.5">
                                                    <h4 className="text-[10px] font-semibold flex items-center gap-1 text-muted-foreground uppercase tracking-wider">
                                                        <Scale className="h-3 w-3" /> Legal Grounding
                                                    </h4>
                                                    {analysisResult.legal_matches.map((m, i) =>
                                                        m.id === "unmapped" ? (
                                                            <p key={i} className="text-[10px] text-muted-foreground italic">Not yet mapped — needs manual legal review.</p>
                                                        ) : (
                                                            <p key={i} className="text-[10px] text-foreground">{m.law} — {m.section}</p>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                            <a href="/review-queue" className="block text-[10px] text-primary underline underline-offset-2 pt-1">
                                                Added to Review Queue →
                                            </a>
                                        </>
                                    )}
                                </div>
                            )}
                            {analysisResult?.error && (
                                <p className="text-xs text-destructive">{analysisResult.message}</p>
                            )}
                        </div>
                    </DashboardCard>
                </div>
            </div>

            {selectedKeyword && (
                <KeywordUsersDialog
                    isOpen={isDialogOpen}
                    onOpenChange={setDialogOpen}
                    keyword={selectedKeyword}
                    usersWithPosts={keywordUsers}
                />
            )}
        </div>
    );
}

"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  ShieldAlert,
  Search,
  Plus,
  Loader2,
  Download,
  ExternalLink,
  AlertTriangle,
  FileText,
  MapPin,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import TimeAgo from "@/components/time-ago";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useMemo, useEffect, useCallback } from "react";
import { User as UserType } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard } from "@/components/dashboard-card";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { api, MonitoringUser } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Loaded only when opened, so neither panel holds up the first render of this page.
const UserDetailsSheet = dynamic(() => import("./components/user-details-sheet"), { ssr: false });
const TargetPostsSheet = dynamic(() => import("./components/target-posts-sheet"), { ssr: false });

const ACTIVE = new Set(["STARTING", "RUNNING", "PROCESSING"]);

// Officer-assigned area of focus for a page. Facebook page posts carry no
// location, so region comes from the target, never guessed from post text.
const GB_DISTRICTS = [
  "Gilgit", "Skardu", "Hunza", "Nagar", "Ghizer",
  "Diamer", "Astore", "Ghanche", "Shigar", "Kharmang",
];

const riskLevelOf = (score: number): UserType["riskLevel"] =>
  score > 90 ? "Critical" : score > 70 ? "High" : score > 40 ? "Medium" : "Low";

const toUserType = (t: MonitoringUser): UserType => ({
  id: t.id.toString(),
  name: t.username,
  avatarUrl: "",
  profileUrl: t.profile_url || "#",
  riskLevel: riskLevelOf(t.risk_score),
  lastActivity: new Date(t.last_active),
  followerCount: 0,
  flagRate: t.risk_score / 100,
});

function ScrapeStatus({ target }: { target: MonitoringUser }) {
  const status = target.last_scrape_status;
  if (!target.profile_url) {
    return <span className="text-[10px] text-muted-foreground font-mono">No page linked</span>;
  }
  const chip = (() => {
    switch (status) {
      case "STARTING":
      case "RUNNING":
        return <Badge variant="outline" className="gap-1 font-mono text-[10px] text-primary border-primary/40"><Loader2 className="h-3 w-3 animate-spin" /> SCRAPING</Badge>;
      case "PROCESSING":
        return <Badge variant="outline" className="gap-1 font-mono text-[10px] text-primary border-primary/40"><Loader2 className="h-3 w-3 animate-spin" /> CLASSIFYING</Badge>;
      case "SUCCEEDED":
        return <Badge variant="outline" className="font-mono text-[10px] text-emerald-500 border-emerald-500/40">SCRAPED</Badge>;
      case "FAILED":
        return <Badge variant="outline" className="gap-1 font-mono text-[10px] text-destructive border-destructive/40"><AlertTriangle className="h-3 w-3" /> FAILED</Badge>;
      default:
        return <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">NOT SCRAPED</Badge>;
    }
  })();
  return (
    <div className="flex flex-col gap-1 max-w-[260px]">
      <div className="flex items-center gap-2">
        {chip}
        {target.last_scrape_at && status !== "NEVER" && (
          <span className="text-[10px] text-muted-foreground font-mono">
            <TimeAgo date={new Date(target.last_scrape_at)} />
          </span>
        )}
      </div>
      {target.last_scrape_note && status !== "NEVER" && (
        <span className={`text-[10px] leading-snug ${status === "FAILED" ? "text-destructive" : "text-muted-foreground"}`}>
          {target.last_scrape_note}
        </span>
      )}
    </div>
  );
}

export default function UserMonitoringPage() {
  const { toast } = useToast();
  const [targets, setTargets] = useState<MonitoringUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [apifyReady, setApifyReady] = useState<boolean | null>(null);

  const [summaryUser, setSummaryUser] = useState<UserType | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [postsTargetId, setPostsTargetId] = useState<number | null>(null);
  const [isPostsOpen, setIsPostsOpen] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTargetUrl, setNewTargetUrl] = useState("");
  const [newTargetName, setNewTargetName] = useState("");
  const [newTargetDistrict, setNewTargetDistrict] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchTargets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.getMonitoring();
      if (!response.error) setTargets(response.data);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTargets();
    api.getIngestStatus().then((s) => setApifyReady(!s.error && s.apify_configured));
  }, [fetchTargets]);

  // Poll only while a scrape is in flight, so the status column moves on its own.
  const anyActive = targets.some((t) => t.last_scrape_status && ACTIVE.has(t.last_scrape_status));
  useEffect(() => {
    if (!anyActive) return;
    const id = setInterval(() => fetchTargets(true), 5000);
    return () => clearInterval(id);
  }, [anyActive, fetchTargets]);

  const startScrape = async (t: MonitoringUser) => {
    const r = await api.scrapeTarget(t.id);
    if (r.error) {
      toast({ variant: "destructive", title: `Couldn't scrape ${t.username}`, description: r.message });
    } else {
      toast({ title: `Scraping ${t.username}`, description: "Apify is running. The status column updates automatically." });
    }
    fetchTargets(true);
  };

  const handleAddTarget = async (scrapeNow: boolean) => {
    if (!newTargetUrl.trim()) return;
    setIsAdding(true);
    setAddError(null);
    const r = await api.addTarget(newTargetUrl.trim(), newTargetName.trim(), newTargetDistrict);
    if (r.error || r.id === undefined) {
      setAddError(r.message || "Could not add target.");
      setIsAdding(false);
      return;
    }
    setNewTargetUrl("");
    setNewTargetName("");
    setNewTargetDistrict("");
    setIsAddDialogOpen(false);
    setIsAdding(false);
    if (scrapeNow) {
      const s = await api.scrapeTarget(r.id);
      if (s.error) toast({ variant: "destructive", title: "Target locked, but the scrape didn't start", description: s.message });
      else toast({ title: "Target locked", description: "Apify is scraping it now." });
    } else {
      toast({ title: "Target locked", description: "Use Scrape now from its menu when you're ready." });
    }
    fetchTargets(true);
  };

  const filtered = useMemo(
    () => targets.filter((t) => t.username.toLowerCase().includes(searchTerm.toLowerCase())),
    [targets, searchTerm]
  );

  // Look the target up live so the posts panel sees fresh scrape state while polling.
  const postsTarget = targets.find((t) => t.id === postsTargetId) || null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Collection"
        icon={Users}
        title="User Monitoring"
        description="Public pages locked for monitoring. A district is assigned to each page by an officer, so every post and comment collected from it is attributed to a real area rather than guessed from the text."
      >
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search targets..."
              className="pl-8 bg-card/50 border-border/50 text-xs font-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={(o) => { setIsAddDialogOpen(o); setAddError(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-xs font-mono">ADD TARGET</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] bg-card border-border/50">
              <DialogHeader>
                <DialogTitle className="font-mono uppercase">Lock a target</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Add a public Facebook page to monitor. Apify scrapes its recent posts and every
                  post goes through the pipeline into the review queue.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="url" className="text-xs font-mono">FACEBOOK PAGE URL</Label>
                  <Input
                    id="url"
                    placeholder="https://www.facebook.com/PageName/"
                    value={newTargetUrl}
                    onChange={(e) => setNewTargetUrl(e.target.value)}
                    className="bg-background/50 border-border/50 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Public pages only. Personal profiles can't be scraped.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-xs font-mono">DISPLAY NAME (OPTIONAL)</Label>
                  <Input
                    id="name"
                    placeholder="Taken from the URL if left blank"
                    value={newTargetName}
                    onChange={(e) => setNewTargetName(e.target.value)}
                    className="bg-background/50 border-border/50 text-xs"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="district" className="text-xs font-mono">DISTRICT</Label>
                  <select
                    id="district"
                    value={newTargetDistrict}
                    onChange={(e) => setNewTargetDistrict(e.target.value)}
                    className="h-9 rounded-md border border-border/50 bg-background/50 px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Not assigned</option>
                    {GB_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <p className="text-[10px] text-muted-foreground">
                    The area this page covers. Every case from it is counted under this district.
                  </p>
                </div>
                {addError && <p className="text-xs text-destructive">{addError}</p>}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => handleAddTarget(false)} disabled={isAdding || !newTargetUrl.trim()}>
                  Lock only
                </Button>
                <Button onClick={() => handleAddTarget(true)} disabled={isAdding || !newTargetUrl.trim()}>
                  {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  Lock &amp; scrape now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {apifyReady === false && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <span>
            <strong className="text-amber-600 dark:text-amber-400">Live scraping is off.</strong>{" "}
            Add <code className="font-mono">APIFY_API_TOKEN</code> to <code className="font-mono">MUST_backend/.env</code> and
            restart the backend. Targets can still be locked in the meantime.
          </span>
        </div>
      )}

      <DashboardCard title="Target List" icon={ShieldAlert} noPadding>
        <div className="rounded-md border border-border/40 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="font-mono text-xs uppercase tracking-wider">Target</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">District</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Risk</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-wider">Flag rate</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Apify scrape</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((t) => {
                  const risk = riskLevelOf(t.risk_score);
                  const busy = !!t.last_scrape_status && ACTIVE.has(t.last_scrape_status);
                  const hasDistrict = t.district && t.district !== "Unknown";
                  return (
                    <TableRow key={t.id} className="border-border/40 hover:bg-muted/20 transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 ring-1 ring-border/50">
                            <AvatarFallback className="text-xs font-mono">{t.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <button
                              type="button"
                              onClick={() => { setPostsTargetId(t.id); setIsPostsOpen(true); }}
                              className="font-medium font-mono text-sm text-primary truncate text-left hover:underline"
                            >
                              {t.username}
                            </button>
                            {t.profile_url ? (
                              <a
                                href={t.profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-muted-foreground font-mono hover:text-primary inline-flex items-center gap-1 truncate max-w-[220px]"
                              >
                                {t.profile_url.replace(/^https?:\/\/(www\.)?/, "")} <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-muted-foreground font-mono">{t.platform} · ID {t.id}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {hasDistrict ? (
                          <span className="inline-flex items-center gap-1 text-xs"><MapPin className="h-3 w-3 text-muted-foreground" />{t.district}</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={risk === "Critical" ? "destructive" : risk === "Medium" ? "outline" : "secondary"}
                          className={`font-mono text-[10px] uppercase tracking-wider border-0
                            ${risk === "Critical" ? "bg-destructive/20 text-destructive" : ""}
                            ${risk === "High" ? "bg-amber-500/20 text-amber-500" : ""}
                            ${risk === "Low" ? "bg-primary/15 text-primary" : ""}`}
                        >
                          {risk}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span className={t.risk_score > 50 ? "text-destructive" : "text-muted-foreground"}>
                          {t.risk_score.toFixed(0)}%
                        </span>
                      </TableCell>
                      <TableCell><ScrapeStatus target={t} /></TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <span className="sr-only">Actions for {t.username}</span>
                                <span aria-hidden className="text-base leading-none">⋯</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border/50">
                              <DropdownMenuItem
                                disabled={!t.profile_url || busy}
                                onSelect={() => startScrape(t)}
                                className="text-xs font-mono focus:bg-primary/10 focus:text-primary"
                              >
                                <Download className="mr-2 h-3 w-3" />
                                {busy ? "SCRAPE RUNNING..." : "SCRAPE NOW"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => { setPostsTargetId(t.id); setIsPostsOpen(true); }}
                                className="text-xs font-mono focus:bg-primary/10 focus:text-primary"
                              >
                                <FileText className="mr-2 h-3 w-3" />
                                VIEW POSTS
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => { setSummaryUser(toUserType(t)); setIsSummaryOpen(true); }}
                                className="text-xs font-mono focus:bg-primary/10 focus:text-primary"
                              >
                                <BarChart className="mr-2 h-3 w-3" />
                                SUMMARIZE HISTORY
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground font-mono text-xs">
                    {searchTerm ? "No targets match that search." : "No targets yet. Use Add target to lock a Facebook page."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>

      {postsTarget && (
        <TargetPostsSheet target={postsTarget} isOpen={isPostsOpen} onOpenChange={setIsPostsOpen} />
      )}
      {summaryUser && (
        <UserDetailsSheet user={summaryUser} isOpen={isSummaryOpen} onOpenChange={setIsSummaryOpen} />
      )}
    </div>
  );
}

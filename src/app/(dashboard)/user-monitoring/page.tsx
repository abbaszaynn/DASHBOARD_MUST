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
import { MoreHorizontal, User, BarChart, ShieldAlert, Search, Filter, Plus, Loader2 } from "lucide-react";
import TimeAgo from "@/components/time-ago";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useMemo, useEffect } from "react";
import UserDetailsSheet from "./components/user-details-sheet";
import { User as UserType } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard } from "@/components/dashboard-card";
import { Input } from "@/components/ui/input";
import { api, MonitoringUser } from "@/lib/api";
import { Label } from "@/components/ui/label";

const mapBackendUserToUserType = (user: MonitoringUser): UserType => {
  let riskLevel: UserType["riskLevel"] = "Low";
  if (user.risk_score > 90) riskLevel = "Critical";
  else if (user.risk_score > 70) riskLevel = "High";
  else if (user.risk_score > 40) riskLevel = "Medium";

  return {
    id: user.id.toString(),
    name: user.username,
    avatarUrl: `https://i.pravatar.cc/150?u=${user.username}`, // Mock avatar
    profileUrl: "#",
    riskLevel: riskLevel,
    lastActivity: new Date(user.last_active),
    followerCount: 0, // Not in backend yet
    flagRate: user.risk_score / 100, // Approximation
  };
};

export default function UserMonitoringPage() {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Target State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTargetUrl, setNewTargetUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.getMonitoring();
      if (!response.error) {
        setUsers(response.data.map(mapBackendUserToUserType));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddTarget = async () => {
    if (!newTargetUrl) return;
    setIsAdding(true);
    try {
      await api.scrapeProfile(newTargetUrl);
      setNewTargetUrl("");
      setIsAddDialogOpen(false);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Failed to add target:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, searchTerm]);


  const handleAction = (user: UserType) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  const getRiskBadgeVariant = (riskLevel: UserType["riskLevel"]) => {
    switch (riskLevel) {
      case "Critical":
        return "destructive";
      case "High":
        return "secondary"; // Will be styled with custom class
      case "Medium":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight uppercase font-mono">User Monitoring</h1>
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
          <Button variant="outline" size="icon" className="border-border/50 bg-card/50">
            <Filter className="h-4 w-4" />
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-xs font-mono">ADD TARGET</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
              <DialogHeader>
                <DialogTitle className="font-mono uppercase">Add New Target</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Enter the profile URL to scrape and monitor.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="url" className="text-xs font-mono">PROFILE URL</Label>
                  <Input
                    id="url"
                    placeholder="https://twitter.com/username"
                    value={newTargetUrl}
                    onChange={(e) => setNewTargetUrl(e.target.value)}
                    className="col-span-3 bg-background/50 border-border/50 text-xs"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTarget} disabled={isAdding || !newTargetUrl}>
                  {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Monitoring"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DashboardCard title="Target List" icon={ShieldAlert} noPadding>
        <div className="rounded-md border border-border/40 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="font-mono text-xs uppercase tracking-wider">User Identity</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Risk Assessment</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-wider">Flag Rate</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-border/40 hover:bg-muted/20 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 ring-1 ring-border/50">
                          <AvatarImage
                            src={user.avatarUrl}
                            alt={user.name}
                          />
                          <AvatarFallback className="text-xs font-mono">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium font-mono text-sm text-primary group-hover:text-primary/80 transition-colors">{user.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">ID: {user.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getRiskBadgeVariant(user.riskLevel)}
                        className={`
                            font-mono text-[10px] uppercase tracking-wider border-0
                            ${user.riskLevel === 'Critical' ? 'bg-destructive/20 text-destructive animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]' : ''}
                            ${user.riskLevel === 'High' ? 'bg-amber-500/20 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]' : ''}
                            ${user.riskLevel === 'Medium' ? 'bg-secondary text-secondary-foreground' : ''}
                        `}
                      >
                        {user.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <span className={user.flagRate! > 0.5 ? "text-destructive" : "text-muted-foreground"}>
                        {(user.flagRate! * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      <TimeAgo date={user.lastActivity} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border/50">
                            <DropdownMenuItem onSelect={() => handleAction(user)} className="text-xs font-mono focus:bg-primary/10 focus:text-primary">
                              <User className="mr-2 h-3 w-3" />
                              VIEW PROFILE
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleAction(user)} className="text-xs font-mono focus:bg-primary/10 focus:text-primary">
                              <BarChart className="mr-2 h-3 w-3" />
                              SUMMARIZE HISTORY
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-mono text-xs">
                    No targets found matching criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>

      {selectedUser && (
        <UserDetailsSheet
          user={selectedUser}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}
    </div>
  );
}

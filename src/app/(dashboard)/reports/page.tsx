"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Download, FileText, ShieldCheck, FileOutput, History } from "lucide-react";
import { auditLogs } from "@/lib/data";
import { addDays, format } from "date-fns";
import TimeAgo from "@/components/time-ago";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/dashboard-card";
import { Label } from "@/components/ui/label";

import { api, FlaggedItem } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [logs, setLogs] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.getFlagged();
        if (!response.error) {
          setLogs(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight uppercase font-mono">Reports & Audits</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-primary/20 hover:bg-primary/10 hover:text-primary">
            <History className="mr-2 h-4 w-4" />
            <span className="text-xs font-mono">ARCHIVE</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <DashboardCard title="Report Generator" icon={FileOutput}>
          <div className="flex flex-wrap items-end gap-4 p-2">
            <div className="grid gap-2">
              <Label className="text-[10px] font-mono text-muted-foreground uppercase">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[260px] justify-start text-left font-normal border-border/50 bg-background/50 text-xs font-mono",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-mono text-muted-foreground uppercase">Region</Label>
              <Select>
                <SelectTrigger className="w-[180px] border-border/50 bg-background/50 text-xs font-mono">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="gilgit">Gilgit</SelectItem>
                  <SelectItem value="skardu">Skardu</SelectItem>
                  <SelectItem value="hunza">Hunza</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-mono text-muted-foreground uppercase">Content Type</Label>
              <Select>
                <SelectTrigger className="w-[180px] border-border/50 bg-background/50 text-xs font-mono">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hate">Hate</SelectItem>
                  <SelectItem value="offensive">Offensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="mr-2 h-4 w-4" />
                <span className="text-xs font-mono">EXPORT PDF</span>
              </Button>
              <Button variant="outline" className="border-border/50 hover:bg-muted/50">
                <Download className="mr-2 h-4 w-4" />
                <span className="text-xs font-mono">EXPORT CSV</span>
              </Button>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Flagged Content History" icon={ShieldCheck} noPadding>
          <div className="rounded-md border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="font-mono text-xs uppercase tracking-wider">User</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider">Category</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider">Confidence</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider">Content</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-6 w-6 ring-1 ring-border/50">
                            <AvatarImage
                              src={`https://i.pravatar.cc/40?u=${log.id}`}
                              alt="User"
                            />
                            <AvatarFallback className="text-[10px] font-mono">
                              U{log.id}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium font-mono text-xs text-primary">User #{log.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider border-0 ${log.category === 'hate' ? 'bg-destructive/10 text-destructive' :
                          log.category === 'offensive' ? 'bg-amber-500/10 text-amber-500' : 'bg-secondary text-secondary-foreground'
                          }`}>
                          {log.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <span className={log.confidence > 80 ? "text-destructive font-bold" : "text-muted-foreground"}>
                          {log.confidence.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono max-w-[300px] truncate" title={log.text}>
                        {log.text}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono text-right">
                        <TimeAgo date={log.timestamp} />
                      </TableCell>
                    </TableRow>
                  ))) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-mono text-xs">
                      No flagged content found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

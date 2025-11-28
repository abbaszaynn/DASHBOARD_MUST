"use client"

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserType } from "@/types";
import { summarizeUserHistory, SummarizeUserHistoryOutput } from "@/ai/flows/summarize-user-history";
import { format } from "date-fns";
import { ExternalLink, Bot, AlertTriangle, Loader2, Calendar, Users, Mail } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserDetailsSheetProps = {
  user: UserType;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function UserDetailsSheet({
  user,
  isOpen,
  onOpenChange,
}: UserDetailsSheetProps) {
    const [summary, setSummary] = useState<SummarizeUserHistoryOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSummarize = async () => {
        setIsLoading(true);
        setSummary(null);
        try {
            const result = await summarizeUserHistory({
                userId: user.id,
                violationHistory: `User has a flag rate of ${user.flagRate! * 100}% with posts categorized as Hate and Offensive.`,
                engagementStatistics: `User has ${user.followerCount} followers.`
            });
            setSummary(result);
        } catch (error) {
            console.error("AI summarization failed:", error);
        }
        setIsLoading(false);
    };

    const getRiskBadgeVariant = (riskLevel: UserType["riskLevel"]) => {
      switch (riskLevel) {
        case "Critical": return "destructive";
        case "High": return "secondary";
        case "Medium": return "outline";
        default: return "default";
      }
    };
    
    return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>User Profile & History</SheetTitle>
          <SheetDescription>
            A summary of the user's activity and risk profile.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <Link href={user.profileUrl} target="_blank" className="text-sm text-primary hover:underline flex items-center gap-1">
                    View Profile <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4"/> Followers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{user.followerCount?.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4"/> Joined</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{user.accountInfo ? format(new Date(user.accountInfo.joinDate), "PPP") : 'N/A'}</p>
                </CardContent>
              </Card>
            </div>
             <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4"/> Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-primary">{user.accountInfo?.email || 'N/A'}</p>
                </CardContent>
              </Card>

            <Separator />
            
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Bot className="h-4 w-4"/> AI Risk Assessment
                    </h3>
                    {!summary && !isLoading && <Button size="sm" variant="outline" onClick={handleSummarize}>Summarize with AI</Button>}
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                </div>

                {summary ? (
                     <div className="space-y-4 text-sm bg-muted/50 p-4 rounded-lg border">
                        <div>
                            <h4 className="font-semibold mb-1">Behavioral Summary</h4>
                            <p className="text-muted-foreground">{summary.summary}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Assessed Risk Level</h4>
                            <Badge variant={getRiskBadgeVariant(summary.riskLevel as UserType["riskLevel"])}>{summary.riskLevel}</Badge>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="space-y-4 text-sm bg-muted/50 p-4 rounded-lg border">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                         <Separator className="my-2"/>
                         <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                ) : (
                    <div className="text-sm text-center text-muted-foreground p-4 bg-muted/20 rounded-lg border border-dashed">
                        Click 'Summarize with AI' to get a risk assessment.
                    </div>
                )}
            </div>
        </div>
        <SheetFooter className="mt-auto">
             <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

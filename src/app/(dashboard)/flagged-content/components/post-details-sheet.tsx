"use client";

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
import type { FlaggedPost } from "@/types";
import { analyzeFlaggedPost, AnalyzeFlaggedPostOutput } from "@/ai/flows/analyze-flagged-post";
import { format } from "date-fns";
import { ExternalLink, Bot, AlertTriangle, ChevronsRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type PostDetailsSheetProps = {
  post: FlaggedPost;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function PostDetailsSheet({
  post,
  isOpen,
  onOpenChange,
}: PostDetailsSheetProps) {
    const [analysis, setAnalysis] = useState<AnalyzeFlaggedPostOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis(null);
        try {
            const result = await analyzeFlaggedPost({
                content: post.content,
                category: post.category,
                confidenceScore: post.confidence,
                userDetails: `User: ${post.user.name}, Profile: ${post.user.url}`,
                postUrl: `https://example.com/post/${post.id}`
            });
            setAnalysis(result);
        } catch (error) {
            console.error("AI analysis failed:", error);
            // Here you could use a toast to show an error message to the user
        }
        setIsLoading(false);
    };

    return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Flagged Post Details</SheetTitle>
          <SheetDescription>
            Review the post and take appropriate action.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Content</h3>
                <p className="text-foreground">{post.content}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">User</h3>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://i.pravatar.cc/40?u=${post.user.name}`} alt={post.user.name} />
                            <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{post.user.name}</span>
                        <Link href={post.user.url} target="_blank">
                           <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary"/>
                        </Link>
                    </div>
                </div>
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Date</h3>
                    <p>{format(new Date(post.date), "PPP p")}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Category & Confidence</h3>
                    <div className="flex items-center gap-2">
                         <Badge variant={ post.category === "Hate" ? "destructive" : post.category === "Offensive" ? "secondary" : "outline"}>
                            {post.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{`${(post.confidence * 100).toFixed(0)}%`}</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Source & Region</h3>
                    <p>{post.source} / {post.region}</p>
                </div>
            </div>
            <Separator />
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Bot className="h-4 w-4"/> AI Analysis (XAI)
                    </h3>
                    {!analysis && !isLoading && <Button size="sm" variant="outline" onClick={handleAnalyze}>Analyze with AI</Button>}
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                </div>

                {analysis ? (
                     <div className="space-y-4 text-sm bg-muted/50 p-4 rounded-lg border">
                        <div>
                            <h4 className="font-semibold mb-1">Analysis Summary</h4>
                            <p className="text-muted-foreground">{analysis.analysis}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Trigger Terms</h4>
                            <div className="flex flex-wrap gap-2">
                                {analysis.triggerTerms.map(term => <Badge key={term} variant="destructive">{term}</Badge>)}
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-1 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Suggested Action</h4>
                            <p className="text-muted-foreground">{analysis.suggestedAction}</p>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="space-y-4 text-sm bg-muted/50 p-4 rounded-lg border">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                         <Separator className="my-2"/>
                         <Skeleton className="h-4 w-1/4" />
                         <div className="flex gap-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                             <Skeleton className="h-6 w-24 rounded-full" />
                         </div>
                    </div>
                ) : (
                    <div className="text-sm text-center text-muted-foreground p-4 bg-muted/20 rounded-lg border border-dashed">
                        Click 'Analyze with AI' to get an explanation for this flag.
                    </div>
                )}
            </div>
        </div>
        <SheetFooter className="mt-auto">
             <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button><ChevronsRight className="mr-2 h-4 w-4" /> Take Action</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

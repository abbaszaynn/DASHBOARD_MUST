"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, FlaggedItem } from "@/lib/api";
import { Activity, Facebook, Twitter, Globe } from "lucide-react";

export function LiveFeed() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFeed = async () => {
        try {
            const response = await api.getLiveFeed();
            if (!response.error) {
                setItems(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch live feed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
        // Poll every 10 seconds
        const interval = setInterval(fetchFeed, 10000);
        return () => clearInterval(interval);
    }, []);

    const getPlatformIcon = (platform: string) => {
        switch (platform?.toLowerCase()) {
            case "facebook":
                return <Facebook className="h-4 w-4 text-blue-600" />;
            case "twitter":
                return <Twitter className="h-4 w-4 text-sky-500" />;
            default:
                return <Globe className="h-4 w-4 text-gray-500" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category?.toLowerCase()) {
            case "hate":
                return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
            case "offensive":
                return "bg-amber-500 text-white hover:bg-amber-600";
            default:
                return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
        }
    };

    return (
        <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live Monitoring Feed
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px]">
                    <div className="space-y-4 pr-4">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 rounded-lg border border-border/40 p-4 text-left text-sm transition-all hover:bg-primary/5 w-full"
                            >
                                <Avatar className="h-10 w-10 border border-border/50">
                                    <AvatarImage src={`https://avatar.vercel.sh/${item.username || "user"}`} alt={item.username} />
                                    <AvatarFallback className="bg-muted text-muted-foreground">{(item.username || "A").substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="font-semibold truncate text-foreground">{item.username || "Anonymous"}</span>
                                                {getPlatformIcon(item.platform)}
                                            </div>
                                            <Badge className={`${getCategoryColor(item.category)} shrink-0`}>
                                                {item.category}
                                            </Badge>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                                    </div>

                                    <p className="text-foreground/80 break-words leading-relaxed text-xs line-clamp-3">
                                        {item.text}
                                    </p>

                                    <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                        <span className="flex items-center gap-1">
                                            <Activity className="h-3 w-3" />
                                            Confidence: <span className={item.confidence > 80 ? "text-primary" : "text-foreground"}>{Math.round(item.confidence)}%</span>
                                        </span>
                                        <span>•</span>
                                        <span>Language: {item.language}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && !loading && (
                            <div className="text-center text-muted-foreground py-8">
                                No data received yet. Waiting for scraper...
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

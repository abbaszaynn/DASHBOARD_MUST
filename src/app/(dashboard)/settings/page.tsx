"use client"

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Tag, KeyRound } from "lucide-react";

export default function SettingsPage() {
    const [keywords, setKeywords] = useState(['hate-term1', 'offensive-word2', 'problem-phrase3']);
    const [hashtags, setHashtags] = useState(['#bannedtopic', '#unsafehashtag', '#criticalissue']);
    const [newKeyword, setNewKeyword] = useState('');
    const [newHashtag, setNewHashtag] = useState('');

    const addKeyword = () => {
        if (newKeyword && !keywords.includes(newKeyword)) {
            setKeywords([...keywords, newKeyword]);
            setNewKeyword('');
        }
    };

    const removeKeyword = (keywordToRemove: string) => {
        setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
    };

    const addHashtag = () => {
        if (newHashtag && !hashtags.includes(newHashtag)) {
            setHashtags([...hashtags, newHashtag]);
            setNewHashtag('');
        }
    };

    const removeHashtag = (hashtagToRemove: string) => {
        setHashtags(hashtags.filter(hashtag => hashtag !== hashtagToRemove));
    };

    return (
        <>
            <PageHeader
                title="Settings"
                description="Manage system-wide settings and watchlists."
            />
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><KeyRound/> Keyword Watchlist</CardTitle>
                        <CardDescription>Add or remove keywords to be automatically flagged and monitored.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input 
                                placeholder="Add new keyword"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                            />
                            <Button onClick={addKeyword}><Plus className="mr-2 h-4 w-4"/> Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {keywords.map(keyword => (
                                <Badge key={keyword} variant="secondary" className="text-base py-1 pl-3 pr-1">
                                    {keyword}
                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => removeKeyword(keyword)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Tag/> Hashtag Watchlist</CardTitle>
                        <CardDescription>Add or remove hashtags to monitor across platforms.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="Add new hashtag"
                                value={newHashtag}
                                onChange={(e) => setNewHashtag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
                             />
                            <Button onClick={addHashtag}><Plus className="mr-2 h-4 w-4"/> Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {hashtags.map(hashtag => (
                                <Badge key={hashtag} className="text-base py-1 pl-3 pr-1">
                                    {hashtag}
                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => removeHashtag(hashtag)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

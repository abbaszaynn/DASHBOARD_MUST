"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User, FlaggedPost } from "@/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExternalLink, Flag, BarChart, MessageSquareQuote } from "lucide-react";
import TimeAgo from "@/components/time-ago";
import { Separator } from "@/components/ui/separator";

type UserWithPosts = {
  user: User;
  posts: Pick<FlaggedPost, 'id' | 'content'>[];
};

type KeywordUsersDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  keyword: string;
  usersWithPosts: UserWithPosts[];
};

const HighlightedText = ({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 text-primary px-1 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};


export default function KeywordUsersDialog({
  isOpen,
  onOpenChange,
  keyword,
  usersWithPosts,
}: KeywordUsersDialogProps) {

  const getRiskBadgeVariant = (riskLevel: User['riskLevel']) => {
    switch (riskLevel) {
      case "Critical": return "destructive";
      case "High": return "secondary";
      case "Medium": return "outline";
      default: return "default";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Users who mentioned "<span className="text-primary">{keyword}</span>"
          </DialogTitle>
          <DialogDescription>
            Showing profiles and posts that have used this keyword.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          {usersWithPosts.length > 0 ? (
            usersWithPosts.map(({ user, posts }) => (
              <div key={user.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://i.pravatar.cc/40?u=${user.name}`} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">Last active: <TimeAgo date={user.lastActivity} /></p>
                    </div>
                    <Link href={user.profileUrl} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                      View Profile <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Flag className="h-3 w-3" />
                      <span>{(user.flagRate! * 100).toFixed(0)}% Flag Rate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart className="h-3 w-3" />
                      <span>{user.followerCount!.toLocaleString()} Followers</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant={getRiskBadgeVariant(user.riskLevel)}>{user.riskLevel} Risk</Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2"><MessageSquareQuote className="h-4 w-4" /> Relevant Posts</h4>
                    {posts.map(post => (
                      <blockquote key={post.id} className="text-sm text-muted-foreground border-l-2 pl-3 italic">
                        <HighlightedText text={post.content} highlight={keyword} />
                      </blockquote>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No users found for this keyword.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

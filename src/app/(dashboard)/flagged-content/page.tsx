"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import {
  MoreHorizontal,
  Search,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { FlaggedPost } from "@/types";
import PostDetailsSheet from "./components/post-details-sheet";
import { useFirestore } from "@/firebase";
import { useCollection } from "@/hooks/use-collection";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";


const mapDocToFlaggedPost = (doc: any): FlaggedPost => {
  const data = doc.data();
  // Convert Firestore Timestamp to JS Date if necessary
  const date = data.date ? (data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date) : new Date().toISOString();
  
  return {
    id: doc.id,
    content: data.content,
    user: {
      name: data.userName,
      avatar: data.userAvatar,
      url: data.userUrl,
    },
    date: date,
    category: data.category,
    confidence: data.confidence,
    source: data.source,
    region: data.region,
    triggerTerms: data.triggerTerms || [], // Ensure triggerTerms is an array
  };
};


export default function FlaggedContentPage() {
  const [selectedPost, setSelectedPost] = useState<FlaggedPost | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -20),
    to: new Date(),
  });
  
  const firestore = useFirestore();
  const postsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "flagged_posts"), orderBy("date", "desc"));
  }, [firestore]);

  const { data: allFlaggedPosts, loading } = useCollection(postsQuery, {
    mapDoc: mapDocToFlaggedPost
  });


  const handleRowClick = (post: FlaggedPost) => {
    setSelectedPost(post);
    setSheetOpen(true);
  };
  
  return (
    <>
      <PageHeader
        title="Flagged Content Review"
        description="Review posts and comments flagged by the AI model."
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by keyword..."
              className="pl-8 sm:w-[300px]"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
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
            <PopoverContent className="w-auto p-0" align="end">
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
      </PageHeader>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : allFlaggedPosts && allFlaggedPosts.length > 0 ? (
              allFlaggedPosts.map((post) => (
                <TableRow
                  key={post.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(post)}
                >
                  <TableCell className="font-medium">{post.user.name}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-xs">
                    {post.content}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        post.category === "Hate"
                          ? "destructive"
                          : post.category === "Offensive"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {post.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{(post.confidence * 100).toFixed(0)}%</TableCell>
                  <TableCell>{format(new Date(post.date), "PPP")}</TableCell>
                  <TableCell>{post.source}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Issue Warning</DropdownMenuItem>
                        <DropdownMenuItem>Request Takedown</DropdownMenuItem>
                        <DropdownMenuItem>
                          Escalate for Legal Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No flagged content found. Try scraping a user profile.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedPost && (
        <PostDetailsSheet
          post={selectedPost}
          isOpen={isSheetOpen}
          onOpenChange={setSheetOpen}
        />
      )}
    </>
  );
}

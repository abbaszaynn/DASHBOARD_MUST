"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Wand2, ThumbsUp, ThumbsDown, Scale, Users, ShieldAlert } from "lucide-react";
import { api, ProcessResponse } from "@/lib/api";

const formSchema = z.object({
  text: z.string().min(10, { message: "Please enter at least 10 characters." }),
});

export default function AiAnalyzer() {
  const [analysis, setAnalysis] = useState<ProcessResponse | null>(null);
  const [submittedText, setSubmittedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await api.process(values.text);
      if (result.error) {
        setError(result.message || "Analysis failed");
      } else {
        setAnalysis(result);
        setSubmittedText(values.text);
      }
    } catch (e) {
      setError("Failed to analyze the text. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category?.toLowerCase()) {
      case "hate":
        return "destructive";
      case "offensive":
        return "secondary"; // Will be styled custom
      default:
        return "default"; // Neutral
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Quick Analysis
        </CardTitle>
        <CardDescription>
          Manually analyze a single sentence or post for hate speech.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Enter text in English, Urdu, or Roman Urdu..."
                      className="resize-none bg-muted/30"
                      rows={3}
                      suppressHydrationWarning
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            {analysis && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Detection Result</h3>
                  <Badge
                    variant={getCategoryBadgeVariant(analysis.category)}
                    className={`uppercase px-3 py-1 ${analysis.category === 'offensive' ? 'bg-amber-500 text-white hover:bg-amber-600' : ''}`}
                  >
                    {analysis.category}
                  </Badge>
                </div>

                <div className="bg-muted/30 p-4 rounded-md text-sm text-foreground/80">
                  {submittedText}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Neutral</span>
                      <span>{analysis.scores?.neutral ?? 0}%</span>
                    </div>
                    <Progress value={analysis.scores?.neutral ?? 0} className="h-2 bg-muted [&>div]:bg-emerald-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Offensive</span>
                      <span>{analysis.scores?.offensive ?? 0}%</span>
                    </div>
                    <Progress value={analysis.scores?.offensive ?? 0} className="h-2 bg-muted [&>div]:bg-amber-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Hate</span>
                      <span>{analysis.scores?.hate ?? 0}%</span>
                    </div>
                    <Progress value={analysis.scores?.hate ?? 0} className="h-2 bg-muted [&>div]:bg-destructive" />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">Detected Language: <span className="font-medium text-foreground">{analysis.language}</span></p>
                </div>

                {analysis.requires_human_review && (
                  <div className="pt-2 border-t border-border/50 space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="uppercase">{analysis.final_tier} tier</Badge>
                      {analysis.cluster?.campaign_flag && (
                        <Badge variant="destructive" className="gap-1">
                          <Users className="h-3 w-3" /> Possible campaign
                        </Badge>
                      )}
                    </div>

                    {analysis.legal_matches && analysis.legal_matches.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                          <Scale className="h-3.5 w-3.5" /> Legal Grounding
                        </h4>
                        <div className="space-y-1.5">
                          {analysis.legal_matches.map((m, i) =>
                            m.id === "unmapped" ? (
                              <p key={i} className="text-xs text-muted-foreground italic">
                                No provision mapped yet — requires manual legal review.
                              </p>
                            ) : (
                              <div key={i} className="text-xs bg-muted/50 p-2 rounded border">
                                <span className="font-medium">{m.law} — {m.section}</span>
                                {m.title && <p className="text-muted-foreground mt-0.5">{m.title}</p>}
                              </div>
                            )
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          Assistive drafting aid only — not an authoritative legal determination.
                        </p>
                      </div>
                    )}

                    <a href="/review-queue" className="text-xs text-primary underline underline-offset-2">
                      This case was added to the Review Queue →
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">Was this analysis helpful?</span>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="h-8 w-8" type="button"><ThumbsUp className="h-3 w-3" /></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8" type="button"><ThumbsDown className="h-3 w-3" /></Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!analysis && (
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Text"
                )}
              </Button>
            )}
            {analysis && (
              <Button type="button" variant="outline" className="w-full" onClick={() => {
                setAnalysis(null);
                form.reset();
              }}>
                Analyze Another
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

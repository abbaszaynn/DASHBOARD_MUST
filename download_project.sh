#!/bin/bash

# ==============================================================================
# Project Export Script
# ==============================================================================
# This script will recreate the entire project structure and all its files.
#
# Instructions:
# 1. Place this script in an empty folder on your local machine.
# 2. Open a bash-compatible terminal (like Git Bash on Windows).
# 3. Run the script with the command: ./download_project.sh
# 4. After it finishes, run 'npm install' to install dependencies.
# ==============================================================================

echo "Starting project export..."

# --- Create directories ---
mkdir -p ".vscode"
mkdir -p "docs"
mkdir -p "src/ai/flows"
mkdir -p "src/app/(dashboard)/flagged-content/components"
mkdir -p "src/app/(dashboard)/reports"
mkdir -p "src/app/(dashboard)/settings"
mkdir -p "src/app/(dashboard)/trend-analysis/components"
mkdir -p "src/app/(dashboard)/user-monitoring/components"
mkdir -p "src/components/dashboard"
mkdir -p "src/components/ui"
mkdir -p "src/firebase"
mkdir -p "src/hooks"
mkdir -p "src/lib"
mkdir -p "src/types"

echo "Directories created."

# --- Create files ---

cat > ".env" << 'EOF'
HATE_SPEECH_API_URL=http://your-local-model-api-url/predict
GEMINI_API_KEY=REPLACE_WITH_YOUR_GEMINI_API_KEY
EOF

cat > ".vscode/extensions.json" << 'EOF'
{
    "recommendations": [
        "github.vscode-pull-request-github"
    ]
}
EOF

cat > "README.md" << 'EOF'
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
EOF

cat > "apphosting.yaml" << 'EOF'
# Settings to manage and configure a Firebase App Hosting backend.
# https://firebase.google.com/docs/app-hosting/configure

runConfig:
  # Increase this value if you'd like to automatically spin up
  # more instances in response to increased traffic.
  maxInstances: 1
EOF

cat > "components.json" << 'EOF'
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
EOF

cat > "docs/backend.json" << 'EOF'
{
  "entities": {
    "FlaggedPost": {
      "title": "Flagged Post",
      "description": "Represents a piece of content that has been flagged for review.",
      "type": "object",
      "properties": {
        "content": {
          "type": "string",
          "description": "The full text content of the post."
        },
        "userId": {
          "type": "string",
          "description": "The ID of the user who created the post."
        },
        "userName": {
          "type": "string",
          "description": "The name of the user who created the post."
        },
        "userAvatar": {
            "type": "string",
            "description": "URL to the user's avatar image."
        },
        "userUrl": {
            "type": "string",
            "description": "URL to the user's profile."
        },
        "date": {
          "type": "string",
          "format": "date-time",
          "description": "The date and time the post was created."
        },
        "category": {
          "type": "string",
          "enum": ["Hate", "Offensive", "Neutral"],
          "description": "The category assigned by the hate speech model."
        },
        "confidence": {
          "type": "number",
          "description": "The confidence score from the model (0-1)."
        },
        "source": {
          "type": "string",
          "description": "The platform where the content originated (e.g., 'Facebook')."
        },
        "region": {
          "type": "string",
          "description": "The geographical region associated with the post."
        }
      },
      "required": ["content", "userId", "userName", "date", "category", "confidence", "source"]
    },
    "UserProfile": {
      "title": "User Profile",
      "description": "Stores information about a monitored user.",
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "The user's display name."
        },
        "avatarUrl": {
          "type": "string",
          "description": "URL to the user's avatar image."
        },
        "profileUrl": {
          "type": "string",
          "description": "URL to the user's social media profile."
        },
        "lastActivity": {
          "type": "string",
          "format": "date-time",
          "description": "The timestamp of the user's last known activity."
        },
        "riskLevel": {
          "type": "string",
          "enum": ["Critical", "High", "Medium", "Low"],
          "description": "The assessed risk level of the user."
        }
      },
      "required": ["name", "profileUrl"]
    }
  },
  "auth": {
    "providers": []
  },
  "firestore": {
    "/flagged_posts/{postId}": {
      "schema": {
        "$ref": "#/entities/FlaggedPost"
      },
      "description": "Stores individual posts that have been flagged by the system."
    },
    "/users/{userId}": {
      "schema": {
        "$ref": "#/entities/UserProfile"
      },
      "description": "Stores profiles of users who are being monitored."
    }
  }
}
EOF

cat > "next.config.ts" << 'EOF'
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
EOF

cat > "package.json" << 'EOF'
{
  "name": "nextn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
    "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@genkit-ai/googleai": "^1.14.1",
    "@genkit-ai/next": "^1.14.1",
    "@hookform/resolvers": "^4.1.3",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "dotenv": "^16.5.0",
    "embla-carousel-react": "^8.6.0",
    "firebase": "^11.9.1",
    "genkit": "^1.14.1",
    "lucide-react": "^0.475.0",
    "next": "15.3.3",
    "patch-package": "^8.0.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "genkit-cli": "^1.14.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
EOF

cat > "src/ai/dev.ts" << 'EOF'
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-flagged-post.ts';
import '@/ai/flows/suggest-keywords-hashtags.ts';
import '@/ai/flows/summarize-user-history.ts';
import '@/ai/flows/analyze-post-with-vertex-ai.ts';
EOF

cat > "src/ai/flows/analyze-flagged-post.ts" << 'EOF'
'use server';

/**
 * @fileOverview Analyzes a flagged post using AI to understand the reasons for the flagging.
 *
 * - analyzeFlaggedPost - A function that handles the analysis of a flagged post.
 * - AnalyzeFlaggedPostInput - The input type for the analyzeFlaggedPost function.
 * - AnalyzeFlaggedPostOutput - The return type for the analyzeFlaggedPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFlaggedPostInputSchema = z.object({
  content: z.string().describe('The content of the flagged post.'),
  category: z.string().describe('The category of the flagged post (Hate, Offensive, Neutral).'),
  confidenceScore: z.number().describe('The confidence score of the AI flagging.'),
  userDetails: z.string().describe('Details about the user who posted the content.'),
  postUrl: z.string().describe('URL of the post'),
});

export type AnalyzeFlaggedPostInput = z.infer<typeof AnalyzeFlaggedPostInputSchema>;

const AnalyzeFlaggedPostOutputSchema = z.object({
  analysis: z.string().describe('AI analysis of the flagged post, including reasons for flagging.'),
  triggerTerms: z.array(z.string()).describe('Highlighted trigger terms identified by the AI.'),
  suggestedAction: z
    .string()
    .describe(
      'Suggested action for the moderator (issue warning, request takedown, escalate for legal review).'
    ),
});

export type AnalyzeFlaggedPostOutput = z.infer<typeof AnalyzeFlaggedPostOutputSchema>;

export async function analyzeFlaggedPost(
  input: AnalyzeFlaggedPostInput
): Promise<AnalyzeFlaggedPostOutput> {
  return analyzeFlaggedPostFlow(input);
}

const analyzeFlaggedPostPrompt = ai.definePrompt({
  name: 'analyzeFlaggedPostPrompt',
  input: {schema: AnalyzeFlaggedPostInputSchema},
  output: {schema: AnalyzeFlaggedPostOutputSchema},
  prompt: `You are an AI assistant helping moderators analyze flagged posts.

  Analyze the following post content, category, confidence score, user details and post URL to understand the reasons for the flagging.

  Based on the analysis, suggest an appropriate action for the moderator.

  Post Content: {{{content}}}
  Category: {{{category}}}
  Confidence Score: {{{confidenceScore}}}
  User Details: {{{userDetails}}}
  Post URL: {{{postUrl}}}

  Provide a detailed analysis and highlight any trigger terms that contributed to the flagging.  Also suggest the best course of action, referencing moderation guidelines.

  Analysis:
  Trigger Terms:
  Suggested Action: `,
});

const analyzeFlaggedPostFlow = ai.defineFlow(
  {
    name: 'analyzeFlaggedPostFlow',
    inputSchema: AnalyzeFlaggedPostInputSchema,
    outputSchema: AnalyzeFlaggedPostOutputSchema,
  },
  async input => {
    const {output} = await analyzeFlaggedPostPrompt(input);
    return output!;
  }
);
EOF

cat > "src/ai/flows/analyze-post-with-vertex-ai.ts" << 'EOF'
'use server';
/**
 * @fileOverview A flow to analyze a post or sentence using an external hate speech detection model.
 *
 * - analyzePost - A function that handles the analysis of a post.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzePostInputSchema, AnalyzePostOutputSchema, type AnalyzePostInput, type AnalyzePostOutput } from '@/ai/schemas';

// This is the tool that calls your custom FastAPI model.
export const detectHateSpeechTool = ai.defineTool(
  {
    name: 'detectHateSpeech',
    description: 'Sends text to an external API for hate speech analysis.',
    inputSchema: AnalyzePostInputSchema,
    outputSchema: AnalyzePostOutputSchema,
  },
  async ({ text }) => {
    // IMPORTANT: Make sure HATE_SPEECH_API_URL is set in your .env file
    const apiUrl = process.env.HATE_SPEECH_API_URL;
    if (!apiUrl) {
      console.error("HATE_SPEECH_API_URL is not set in .env file.");
      throw new Error("Hate speech detection service is not configured.");
    }
    
    console.log(`Calling hate speech API at: ${apiUrl}`);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Response:", errorBody);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error("Error calling hate speech detection API:", error);
      throw new Error("Failed to get analysis from the hate speech detection service.");
    }
  }
);


export async function analyzePost(input: AnalyzePostInput): Promise<AnalyzePostOutput> {
  return analyzePostFlow(input);
}

const analyzePostFlow = ai.defineFlow(
  {
    name: 'analyzePostFlow',
    inputSchema: AnalyzePostInputSchema,
    outputSchema: AnalyzePostOutputSchema,
  },
  async (input) => {
    // Instead of calling a prompt, we directly call our tool.
    const analysisResult = await detectHateSpeechTool(input);
    return analysisResult;
  }
);
EOF

cat > "src/ai/flows/explain-ai-predictions.ts" << 'EOF'
'use server';

/**
 * @fileOverview A flow to explain AI predictions by highlighting trigger terms in flagged content.
 *
 * - explainAiPredictions - A function that handles the explanation of AI predictions.
 * - ExplainAiPredictionsInput - The input type for the explainAiPredictions function.
 * - ExplainAiPredictionsOutput - The return type for the explainAiPredictions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainAiPredictionsInputSchema = z.object({
  content: z.string().describe('The content to analyze for hate speech.'),
  category: z
    .string()
    .describe(
      'The category of the content (Hate, Offensive, Neutral) as predicted by the AI.'
    ),
  confidenceScore: z
    .number()
    .describe('The confidence score of the AI prediction.'),
});
export type ExplainAiPredictionsInput = z.infer<typeof ExplainAiPredictionsInputSchema>;

const ExplainAiPredictionsOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'An explanation of why the AI flagged the content, highlighting trigger terms.'
    ),
  highlightedContent: z
    .string()
    .describe('The original content with trigger terms highlighted.'),
});
export type ExplainAiPredictionsOutput = z.infer<typeof ExplainAiPredictionsOutputSchema>;

export async function explainAiPredictions(
  input: ExplainAiPredictionsInput
): Promise<ExplainAiPredictionsOutput> {
  return explainAiPredictionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainAiPredictionsPrompt',
  input: {schema: ExplainAiPredictionsInputSchema},
  output: {schema: ExplainAiPredictionsOutputSchema},
  prompt: `You are an AI content moderation expert. Given the following content, category, and confidence score from an AI model, explain why the content was flagged and highlight the trigger terms. Return the original content with trigger terms highlighted in markdown. Use XAI (Explainable AI) logic to determine which words or phrases contributed most to the AI model's prediction.

Content: {{{content}}}
Category: {{{category}}}
Confidence Score: {{{confidenceScore}}}

Explanation (including highlighted content):`,
});

const explainAiPredictionsFlow = ai.defineFlow(
  {
    name: 'explainAiPredictionsFlow',
    inputSchema: ExplainAiPredictionsInputSchema,
    outputSchema: ExplainAiPredictionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
EOF

cat > "src/ai/flows/suggest-keywords-hashtags.ts" << 'EOF'
'use server';
/**
 * @fileOverview Suggests relevant keywords and hashtags based on current trends and flagged content.
 *
 * - suggestKeywordsHashtags - A function that suggests keywords and hashtags.
 * - SuggestKeywordsHashtagsInput - The input type for the suggestKeywordsHashtags function.
 * - SuggestKeywordsHashtagsOutput - The return type for the suggestKeywordsHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestKeywordsHashtagsInputSchema = z.object({
  currentTrends: z
    .string()
    .describe('A description of current trending topics.'),
  flaggedContentSummary: z
    .string()
    .describe('A summary of recently flagged content.'),
});
export type SuggestKeywordsHashtagsInput = z.infer<
  typeof SuggestKeywordsHashtagsInputSchema
>;

const SuggestKeywordsHashtagsOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('A list of suggested keywords.'),
  hashtags: z
    .array(z.string())
    .describe('A list of suggested hashtags.'),
});
export type SuggestKeywordsHashtagsOutput = z.infer<
  typeof SuggestKeywordsHashtagsOutputSchema
>;

export async function suggestKeywordsHashtags(
  input: SuggestKeywordsHashtagsInput
): Promise<SuggestKeywordsHashtagsOutput> {
  return suggestKeywordsHashtagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestKeywordsHashtagsPrompt',
  input: {schema: SuggestKeywordsHashtagsInputSchema},
  output: {schema: SuggestKeywordsHashtagsOutputSchema},
  prompt: `You are an AI assistant helping an administrator to improve hate speech detection.

  Based on the current trends and a summary of flagged content, suggest relevant keywords and hashtags to proactively update the watchlist.

  Current Trends: {{{currentTrends}}}
  Flagged Content Summary: {{{flaggedContentSummary}}}

  Respond with a list of keywords and hashtags.
  Keywords:
  Hashtags:`,
});

const suggestKeywordsHashtagsFlow = ai.defineFlow(
  {
    name: 'suggestKeywordsHashtagsFlow',
    inputSchema: SuggestKeywordsHashtagsInputSchema,
    outputSchema: SuggestKeywordsHashtagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
EOF

cat > "src/ai/flows/summarize-user-history.ts" << 'EOF'
'use server';

/**
 * @fileOverview Summarizes a user's history of flagged content and engagement.
 *
 * - summarizeUserHistory - A function that summarizes a user's history.
 * - SummarizeUserHistoryInput - The input type for the summarizeUserHistory function.
 * - SummarizeUserHistoryOutput - The return type for the summarizeUserHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUserHistoryInputSchema = z.object({
  userId: z.string().describe('The ID of the user to summarize.'),
  violationHistory: z.string().describe('The violation history of the user.'),
  engagementStatistics: z.string().describe('The engagement statistics of the user.'),
});
export type SummarizeUserHistoryInput = z.infer<typeof SummarizeUserHistoryInputSchema>;

const SummarizeUserHistoryOutputSchema = z.object({
  summary: z.string().describe('A summary of the user\'s history of flagged content and engagement.'),
  riskLevel: z.string().describe('An assessment of the user\'s risk level (high/medium/critical).'),
});
export type SummarizeUserHistoryOutput = z.infer<typeof SummarizeUserHistoryOutputSchema>;

export async function summarizeUserHistory(input: SummarizeUserHistoryInput): Promise<SummarizeUserHistoryOutput> {
  return summarizeUserHistoryFlow(input);
}

const summarizeUserHistoryPrompt = ai.definePrompt({
  name: 'summarizeUserHistoryPrompt',
  input: {schema: SummarizeUserHistoryInputSchema},
  output: {schema: SummarizeUserHistoryOutputSchema},
  prompt: `You are an AI moderator tasked with summarizing a user's history of flagged content and engagement to assess their risk level.\n\nSummarize the following information about the user:\n\nViolation History: {{{violationHistory}}}\nEngagement Statistics: {{{engagementStatistics}}}\n\nBased on this information, provide a summary of the user's history and assess their risk level (high/medium/critical).`,
});

const summarizeUserHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeUserHistoryFlow',
    inputSchema: SummarizeUserHistoryInputSchema,
    outputSchema: SummarizeUserHistoryOutputSchema,
  },
  async input => {
    const {output} = await summarizeUserHistoryPrompt(input);
    return output!;
  }
);
EOF

cat > "src/ai/genkit.ts" << 'EOF'
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
EOF

cat > "src/ai/schemas.ts" << 'EOF'
/**
 * @fileOverview This file contains the Zod schemas and TypeScript types for the AI flows.
 * It is kept separate from the flow definitions to avoid "use server" conflicts,
 * as these types need to be imported into client-side components.
 */

import { z } from 'genkit';

// Schemas for analyze-post-with-vertex-ai.ts
export const AnalyzePostInputSchema = z.object({
  text: z.string().describe('The post or sentence to analyze.'),
});
export type AnalyzePostInput = z.infer<typeof AnalyzePostInputSchema>;

export const AnalyzePostOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'The predicted category of the text (Hate, Offensive, Neutral).'
    ),
  predictionProbability: z
    .number()
    .describe('The probability of the predicted category.'),
  explanation: z
    .string()
    .describe(
      'An explanation of the AI prediction, highlighting toxic words and phrases.'
    ),
});
export type AnalyzePostOutput = z.infer<typeof AnalyzePostOutputSchema>;
EOF

cat > "src/app/(dashboard)/flagged-content/components/post-details-sheet.tsx" << 'EOF'
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
EOF

cat > "src/app/(dashboard)/flagged-content/page.tsx" << 'EOF'
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
EOF

cat > "src/app/(dashboard)/layout.tsx" << 'EOF'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { Home, TrendingUp, Flag, Users, FileText, SettingsIcon } from "lucide-react";
import { UserNav } from "@/components/user-nav";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/trend-analysis", icon: TrendingUp, label: "Trend Analysis" },
  { href: "/flagged-content", icon: Flag, label: "Flagged Content" },
  { href: "/user-monitoring", icon: Users, label: "User Monitoring" },
  { href: "/reports", icon: FileText, label: "Reports" },
];


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="w-8 h-8 text-primary" />
            <span className="text-lg font-semibold">MUST</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
               <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton tooltip={item.label} isActive={pathname === item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarHeader>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href="/settings">
                        <SidebarMenuButton tooltip="Settings" isActive={pathname === '/settings'}>
                            <SettingsIcon />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger />
            <UserNav />
        </header>
        <main className="p-4 lg:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
EOF

cat > "src/app/(dashboard)/reports/page.tsx" << 'EOF'
"use client";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { auditLogs } from "@/lib/data";
import { addDays, format, formatDistanceToNow } from "date-fns";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  return (
    <>
      <PageHeader
        title="Reports & Audit Logs"
        description="Generate custom reports and review system activity logs."
      />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <FileText />
                Custom Report Builder
              </div>
            </CardTitle>
            <CardDescription>
              Select parameters to generate and export a report.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Date Range</label>
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
                <label className="text-sm font-medium">Region</label>
                <Select>
                  <SelectTrigger className="w-[180px]">
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
                <label className="text-sm font-medium">Content Type</label>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hate">Hate</SelectItem>
                    <SelectItem value="offensive">Offensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                 <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
                 <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>
              Logs of all moderator and admin actions for traceability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={`https://i.pravatar.cc/40?u=${log.user.name}`}
                              alt={log.user.name}
                            />
                            <AvatarFallback>
                              {log.user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{log.user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.details}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(log.timestamp), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
EOF

cat > "src/app/(dashboard)/settings/page.tsx" << 'EOF'
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
EOF

cat > "src/app/(dashboard)/trend-analysis/components/keyword-users-dialog.tsx" << 'EOF'
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
import { formatDistanceToNow } from "date-fns";
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
                      <p className="text-xs text-muted-foreground">Last active: {formatDistanceToNow(new Date(user.lastActivity), { addSuffix: true })}</p>
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
                   <Separator className="my-3"/>
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2"><MessageSquareQuote className="h-4 w-4"/> Relevant Posts</h4>
                        {posts.map(post => (
                           <blockquote key={post.id} className="text-sm text-muted-foreground border-l-2 pl-3 italic">
                                <HighlightedText text={post.content} highlight={keyword}/>
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
EOF

cat > "src/app/(dashboard)/trend-analysis/page.tsx" << 'EOF'
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { weeklyTrends, regionalBreakdown, platformSources, hotKeywords, flaggedPosts, users } from "@/lib/data";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { suggestKeywordsHashtags, SuggestKeywordsHashtagsOutput } from "@/ai/flows/suggest-keywords-hashtags";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import KeywordUsersDialog from "./components/keyword-users-dialog";
import type { User, FlaggedPost } from "@/types";

const chartConfigWeekly = {
  Hate: { label: "Hate", color: "hsl(var(--chart-3))" },
  Offensive: { label: "Offensive", color: "hsl(var(--chart-4))" },
};

const chartConfigRegional = {
  value: { label: "Count", color: "hsl(var(--chart-1))" },
};

const chartConfigPlatform = {
  value: { label: "Count", color: "hsl(var(--chart-2))" },
  Facebook: { label: "Facebook", color: "hsl(var(--chart-1))" },
  Web: { label: "Web", color: "hsl(var(--chart-2))" },
  Twitter: { label: "Twitter", color: "hsl(var(--chart-3))" },
  Instagram: { label: "Instagram", color: "hsl(var(--chart-4))" },
};

const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
];

type UserWithPosts = {
  user: User;
  posts: Pick<FlaggedPost, 'id' | 'content'>[];
};

export default function TrendAnalysisPage() {
    const [currentTrends, setCurrentTrends] = useState("");
    const [flaggedSummary, setFlaggedSummary] = useState("");
    const [suggestions, setSuggestions] = useState<SuggestKeywordsHashtagsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [keywordUsers, setKeywordUsers] = useState<UserWithPosts[]>([]);

    const handleGetSuggestions = async () => {
        setIsLoading(true);
        setSuggestions(null);
        try {
            const result = await suggestKeywordsHashtags({
                currentTrends,
                flaggedContentSummary: flaggedSummary,
            });
            setSuggestions(result);
        } catch (error) {
            console.error("AI suggestion failed:", error);
        }
        setIsLoading(false);
    }
    
    const getUsersForKeyword = (keyword: string): UserWithPosts[] => {
        if (!keyword) return [];
        
        const relevantPosts = flaggedPosts.filter(post => 
            post.content.toLowerCase().includes(keyword.toLowerCase())
        );

        const usersWithPosts = new Map<string, { user: User; posts: Pick<FlaggedPost, 'id' | 'content'>[] }>();

        relevantPosts.forEach(post => {
            const fullUser = users.find(u => u.name === post.user.name);
            if (fullUser) {
                if (!usersWithPosts.has(fullUser.id)) {
                    usersWithPosts.set(fullUser.id, { user: fullUser, posts: [] });
                }
                usersWithPosts.get(fullUser.id)!.posts.push({ id: post.id, content: post.content });
            }
        });
        
        return Array.from(usersWithPosts.values());
    }

    const handleKeywordClick = (keyword: string) => {
        setSelectedKeyword(keyword);
        setKeywordUsers(getUsersForKeyword(keyword));
        setDialogOpen(true);
    };


  return (
    <>
      <PageHeader
        title="Trend Analysis"
        description="Visualize hate speech trends and platform statistics."
      />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Hate Speech Trends</CardTitle>
            <CardDescription>Volume of Hate vs. Offensive content over the last week.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigWeekly} className="h-[300px] w-full">
              <LineChart data={weeklyTrends} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Line type="monotone" dataKey="Hate" stroke="hsl(var(--chart-3))" strokeWidth={3} dot={true} />
                <Line type="monotone" dataKey="Offensive" stroke="hsl(var(--chart-4))" strokeWidth={3} dot={true} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Regional Breakdown</CardTitle>
                    <CardDescription>Flagged content count by region.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigRegional} className="h-[300px] w-full">
                        <BarChart data={regionalBreakdown} layout="vertical" margin={{left: 10}}>
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                            <XAxis type="number" hide />
                            <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={5}>
                                <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Platform Sources</CardTitle>
                    <CardDescription>Origin of flagged content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigPlatform} className="h-[300px] w-full">
                        <BarChart data={platformSources} margin={{top: 20}}>
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis hide/>
                            <Tooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="value" radius={8}>
                                {platformSources.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                                <LabelList dataKey="value" position="top" offset={8} className="fill-foreground" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Flame className="h-6 w-6 text-orange-500" /> Hot Keywords</CardTitle>
                <CardDescription>Click on a keyword to see profiles who have used the term.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {hotKeywords.map(keyword => (
                        <Button key={keyword} variant="secondary" onClick={() => handleKeywordClick(keyword)}>
                            {keyword}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6" /> AI Keyword & Hashtag Suggestions</CardTitle>
                <CardDescription>Provide current trends and a summary of flagged content to get AI-powered suggestions for your watchlists.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <Textarea placeholder="Describe current trending topics..." value={currentTrends} onChange={(e) => setCurrentTrends(e.target.value)} />
                    <Textarea placeholder="Provide a summary of recently flagged content..." value={flaggedSummary} onChange={(e) => setFlaggedSummary(e.target.value)}/>
                </div>
                <Button onClick={handleGetSuggestions} disabled={isLoading || !currentTrends || !flaggedSummary}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Get Suggestions
                </Button>

                {isLoading && (
                    <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                        <Skeleton className="h-5 w-1/4" />
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-28 rounded-full" />
                        </div>
                        <Skeleton className="h-5 w-1/4 mt-4" />
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-28 rounded-full" />
                        </div>
                    </div>
                )}

                {suggestions && (
                    <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                        <div>
                            <h4 className="font-semibold mb-2">Suggested Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Suggested Hashtags</h4>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.hashtags.map(ht => <Badge key={ht} variant="default">{ht}</Badge>)}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
      
      {selectedKeyword && (
        <KeywordUsersDialog
            isOpen={isDialogOpen}
            onOpenChange={setDialogOpen}
            keyword={selectedKeyword}
            usersWithPosts={keywordUsers}
        />
      )}
    </>
  );
}
EOF

cat > "src/app/(dashboard)/user-monitoring/components/user-details-sheet.tsx" << 'EOF'
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
EOF

cat > "src/app/(dashboard)/user-monitoring/page.tsx" << 'EOF'
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
import { PageHeader } from "@/components/page-header";
import { MoreHorizontal, User, BarChart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useMemo } from "react";
import UserDetailsSheet from "./components/user-details-sheet";
import { User as UserType } from "@/types";
import { useFirestore } from "@/firebase";
import { useCollection } from "@/hooks/use-collection";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";


const mapDocToUser = (doc: any): UserType => {
  const data = doc.data();
  const lastActivity = data.lastActivity ? (data.lastActivity instanceof Timestamp ? data.lastActivity.toDate() : new Date(data.lastActivity)) : new Date();

  // Simple consistent hash for placeholder data
  const idHash = doc.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

  return {
    id: doc.id,
    name: data.name,
    avatarUrl: data.avatarUrl,
    profileUrl: data.profileUrl,
    riskLevel: data.riskLevel,
    lastActivity: lastActivity,
    // These would be calculated fields in a real app - using a simple hash for consistent placeholders
    followerCount: (idHash % 4500) + 500, // Consistent placeholder between 500-5000
    flagRate: ((idHash % 80) / 100) + 0.1, // Consistent placeholder between 0.1-0.9
  };
};


export default function UserMonitoringPage() {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const firestore = useFirestore();
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"), orderBy("name", "asc"));
  }, [firestore]);

  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery, {
    mapDoc: mapDocToUser
  });


  const handleAction = (user: UserType) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };
  
  const getRiskBadgeVariant = (riskLevel: UserType["riskLevel"]) => {
    switch (riskLevel) {
      case "Critical":
        return "destructive";
      case "High":
        return "secondary";
      case "Medium":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <>
      <PageHeader
        title="User Monitoring"
        description="A list of all users who have had content flagged by the system, stored in Firestore."
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead className="text-right">Flag Rate</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersLoading ? (
               Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-24" /></div></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : allUsers && allUsers.length > 0 ? (
              allUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.avatarUrl}
                          alt={user.name}
                          data-ai-hint="user avatar"
                        />
                        <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(user.riskLevel)}>
                      {user.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {(user.flagRate! * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(user.lastActivity), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleAction(user)}>
                              <User className="mr-2 h-4 w-4" />
                              View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleAction(user)}>
                              <BarChart className="mr-2 h-4 w-4" />
                              Summarize History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No monitored users found in Firestore.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       {selectedUser && (
        <UserDetailsSheet
          user={selectedUser}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}
    </>
  );
}
EOF

cat > "src/app/globals.css" << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer base {
  :root {
    --background: 210 20% 95%;
    --foreground: 210 10% 23%;
    --card: 210 20% 100%;
    --card-foreground: 210 10% 23%;
    --popover: 210 20% 100%;
    --popover-foreground: 210 10% 23%;
    --primary: 210 70% 40%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 20% 88%;
    --secondary-foreground: 210 10% 23%;
    --muted: 210 20% 88%;
    --muted-foreground: 210 10% 45%;
    --accent: 180 60% 50%;
    --accent-foreground: 180 100% 15%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 210 15% 85%;
    --input: 210 15% 88%;
    --ring: 210 70% 40%;
    --chart-1: 210 70% 40%;
    --chart-2: 180 60% 50%;
    --chart-3: 0 84.2% 60.2%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
    --sidebar-background: 210 10% 12%;
    --sidebar-foreground: 210 20% 85%;
    --sidebar-primary: 210 70% 50%;
    --sidebar-primary-foreground: 210 40% 98%;
    --sidebar-accent: 210 10% 20%;
    --sidebar-accent-foreground: 210 20% 98%;
    --sidebar-border: 210 10% 20%;
    --sidebar-ring: 210 70% 50%;
  }
  .dark {
    --background: 210 10% 10%;
    --foreground: 210 20% 95%;
    --card: 210 10% 15%;
    --card-foreground: 210 20% 95%;
    --popover: 210 10% 10%;
    --popover-foreground: 210 20% 95%;
    --primary: 210 70% 50%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 10% 25%;
    --secondary-foreground: 210 20% 98%;
    --muted: 210 10% 25%;
    --muted-foreground: 210 20% 75%;
    --accent: 180 60% 50%;
    --accent-foreground: 180 100% 15%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 210 10% 25%;
    --input: 210 10% 25%;
    --ring: 210 70% 50%;
    --chart-1: 210 70% 50%;
    --chart-2: 180 60% 50%;
    --chart-3: 0 72.2% 50.6%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --sidebar-background: 210 10% 10%;
    --sidebar-foreground: 210 20% 95%;
    --sidebar-primary: 210 70% 50%;
    --sidebar-primary-foreground: 210 40% 98%;
    --sidebar-accent: 210 10% 20%;
    --sidebar-accent-foreground: 210 20% 98%;
    --sidebar-border: 210 10% 25%;
    --sidebar-ring: 210 70% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOF

cat > "src/app/layout.tsx" << 'EOF'
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import DashboardLayout from './(dashboard)/layout';

export const metadata: Metadata = {
  title: 'MUST Dashboard',
  description: 'Multilingual Hate Speech Detection and Mitigation System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
EOF

cat > "src/app/page.tsx" << 'EOF'
"use client"

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Users, Flag, ShieldAlert, TrendingUp, BarChart3 } from "lucide-react";
import type { FlaggedPost } from "@/types";
import { useFirestore } from "@/firebase";
import { useCollection } from "@/hooks/use-collection";
import { collection, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import AiAnalyzer from "@/components/dashboard/ai-analyzer";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { weeklyTrends, platformSources } from "@/lib/data";

const chartConfigWeekly = {
  Hate: { label: "Hate", color: "hsl(var(--chart-3))" },
  Offensive: { label: "Offensive", color: "hsl(var(--chart-4))" },
};

const chartConfigPlatform = {
  value: { label: "Count", color: "hsl(var(--chart-2))" },
  Facebook: { label: "Facebook", color: "hsl(var(--chart-1))" },
  Web: { label: "Web", color: "hsl(var(--chart-2))" },
  Twitter: { label: "Twitter", color: "hsl(var(--chart-3))" },
  Instagram: { label: "Instagram", color: "hsl(var(--chart-4))" },
};

const chartConfigCategory = {
  Hate: { label: "Hate", color: "hsl(var(--chart-3))" },
  Offensive: { label: "Offensive", color: "hsl(var(--chart-4))" },
  Neutral: { label: "Neutral", color: "hsl(var(--chart-5))" },
};

const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
];


const mapDocToFlaggedPost = (doc: any): FlaggedPost => {
  const data = doc.data();
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
    triggerTerms: data.triggerTerms || [],
  };
};


export default function DashboardPage() {
  const firestore = useFirestore();
  
  const allPostsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "flagged_posts"));
  }, [firestore]);

  const recentPostsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "flagged_posts"), orderBy("date", "desc"), limit(5));
  }, [firestore]);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"));
  }, [firestore]);

  const { data: recentFlaggedPosts, loading } = useCollection(recentPostsQuery, {
    mapDoc: mapDocToFlaggedPost
  });

  const { data: allFlaggedPosts, loading: allPostsLoading } = useCollection(allPostsQuery);
  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);


  const totalPostsAnalyzed = (allFlaggedPosts?.length || 0) > 0 ? (allFlaggedPosts?.length || 0) : 10200; // Placeholder base
  const totalFlaggedCount = allFlaggedPosts?.length || 0;
  const hateSpeechCount = allFlaggedPosts?.filter(p => p.data().category === 'Hate').length || 0;
  const offensiveSpeechCount = allFlaggedPosts?.filter(p => p.data().category === 'Offensive').length || 0;
  const monitoredUsersCount = allUsers?.length || 0;
  const neutralCount = Math.max(0, totalPostsAnalyzed - totalFlaggedCount); // Estimate neutral

   const categoryBreakdown = [
    { name: 'Hate', value: hateSpeechCount, fill: 'hsl(var(--chart-3))' },
    { name: 'Offensive', value: offensiveSpeechCount, fill: 'hsl(var(--chart-4))' },
    { name: 'Neutral', value: neutralCount, fill: 'hsl(var(--chart-5))' },
  ];


  return (
    <>
      <PageHeader title="Dashboard" description="A real-time overview of hate speech detection and mitigation activities." />
      
      <div className="space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AiAnalyzer />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5"/>
                        Category Breakdown
                    </CardTitle>
                    <CardDescription>Distribution of all analyzed content by category.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={chartConfigCategory} className="h-[250px] w-full">
                        <BarChart data={categoryBreakdown} layout="vertical" margin={{left: 10}}>
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={60} />
                            <XAxis type="number" hide />
                            <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="value" radius={5}>
                                {categoryBreakdown.map((entry) => (
                                    <Cell key={entry.name} fill={entry.fill} />
                                ))}
                                <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hate Speech Posts</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    {allPostsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-destructive">{hateSpeechCount}</div>}
                    <p className="text-xs text-muted-foreground">Total posts flagged as hate.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monitored Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {usersLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{monitoredUsersCount}</div>}
                    <p className="text-xs text-muted-foreground">Users with flagged content.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts Analyzed</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalPostsAnalyzed.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Across all platforms.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Flagged</CardTitle>
                    <Flag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {allPostsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{totalFlaggedCount}</div>}
                    <p className="text-xs text-muted-foreground">Hate & Offensive content.</p>
                </CardContent>
            </Card>
        </div>
      
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Hate Speech Trends</CardTitle>
                <CardDescription>Volume of Hate vs. Offensive content over the last week.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigWeekly} className="h-[300px] w-full">
                  <LineChart data={weeklyTrends} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Line type="monotone" dataKey="Hate" stroke="hsl(var(--chart-3))" strokeWidth={3} dot={true} />
                    <Line type="monotone" dataKey="Offensive" stroke="hsl(var(--chart-4))" strokeWidth={3} dot={true} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Platform Sources</CardTitle>
                    <CardDescription>Origin of flagged content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigPlatform} className="h-[300px] w-full">
                        <BarChart data={platformSources} margin={{top: 20}}>
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis hide/>
                            <Tooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="value" radius={8}>
                                {platformSources.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                                <LabelList dataKey="value" position="top" offset={8} className="fill-foreground" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
      
        <Card>
            <CardHeader>
              <CardTitle>Recent Flagged Content</CardTitle>
              <CardDescription>The 5 most recently flagged posts from all monitored sources.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead className="text-center">Category</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : recentFlaggedPosts && recentFlaggedPosts.length > 0 ? (
                    recentFlaggedPosts.map((post: FlaggedPost) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.user.name}</TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-sm">{post.content}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={post.category === "Hate" ? "destructive" : post.category === "Offensive" ? "secondary" : "outline"}>
                            {post.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{`${(post.confidence * 100).toFixed(0)}%`}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No recent flagged content found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
EOF

cat > "src/components/dashboard/ai-analyzer.tsx" << 'EOF'
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
import { Loader2, Wand2 } from "lucide-react";
import { analyzePost } from "@/ai/flows/analyze-post-with-vertex-ai";
import { type AnalyzePostOutput } from "@/ai/schemas";

const formSchema = z.object({
  text: z.string().min(10, { message: "Please enter at least 10 characters." }),
});

export default function AiAnalyzer() {
  const [analysis, setAnalysis] = useState<AnalyzePostOutput | null>(null);
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
      const result = await analyzePost({ text: values.text });
      setAnalysis(result);
    } catch (e) {
      setError("Failed to analyze the text. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category.toLowerCase()) {
      case "hate":
        return "destructive";
      case "offensive":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Card>
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
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Enter text in English, Urdu, or Roman Urdu..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            {analysis && (
              <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Analysis Result</h3>
                  <Badge variant={getCategoryBadgeVariant(analysis.category)}>
                    {analysis.category}
                  </Badge>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Confidence Score</span>
                    <span>{(analysis.predictionProbability * 100).toFixed(0)}%</span>
                  </div>
                   <Progress value={analysis.predictionProbability * 100} className="h-2 [&>div]:bg-primary" />
                </div>
                <div>
                    <h4 className="font-medium text-sm mb-1">Explanation</h4>
                    <p className="text-sm text-muted-foreground bg-background p-3 rounded-md">
                        {analysis.explanation}
                    </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Text"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
EOF

cat > "src/components/icons.tsx" << 'EOF'
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}
EOF

cat > "src/components/page-header.tsx" << 'EOF'
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6", className)}>
      <div className="grid gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
EOF

cat > "src/components/ui/accordion.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
EOF

cat > "src/components/ui/alert-dialog.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
EOF

cat > "src/components/ui/alert.tsx" << 'EOF'
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
EOF

cat > "src/components/ui/avatar.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
EOF

cat > "src/components/ui/badge.tsx" << 'EOF'
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
EOF

cat > "src/components/ui/button.tsx" << 'EOF'
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
EOF

cat > "src/components/ui/calendar.tsx" << 'EOF'
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
EOF

cat > "src/components/ui/card.tsx" << 'EOF'
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
EOF

cat > "src/components/ui/carousel.tsx" << 'EOF'
"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute  h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
EOF

cat > "src/components/ui/chart.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
EOF

cat > "src/components/ui/checkbox.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
EOF

cat > "src/components/ui/collapsible.tsx" << 'EOF'
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
EOF

cat > "src/components/ui/dialog.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
EOF

cat > "src/components/ui/dropdown-menu.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
EOF

cat > "src/components/ui/form.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
EOF

cat > "src/components/ui/input.tsx" << 'EOF'
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
EOF

cat > "src/components/ui/label.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
EOF

cat > "src/components/ui/menubar.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group {...props} />
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal {...props} />
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup {...props} />
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
      className
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
EOF

cat > "src/components/ui/popover.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
EOF

cat > "src/components/ui/progress.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
EOF

cat > "src/components/ui/radio-group.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
EOF

cat > "src/components/ui/scroll-area.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
EOF

cat > "src/components/ui/select.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
EOF

cat > "src/components/ui/separator.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
EOF

cat > "src/components/ui/sheet.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
EOF

cat > "src/components/ui/sidebar.tsx" << 'EOF'
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        className="group peer hidden md:block text-sidebar-foreground"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
          )}
        />
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
EOF

cat > "src/components/ui/skeleton.tsx" << 'EOF'
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
EOF

cat > "src/components/ui/slider.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
EOF

cat > "src/components/ui/switch.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
EOF

cat > "src/components/ui/table.tsx" << 'EOF'
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
EOF

cat > "src/components/ui/tabs.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
EOF

cat > "src/components/ui/textarea.tsx" << 'EOF'
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
EOF

cat > "src/components/ui/toast.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
EOF

cat > "src/components/ui/toaster.tsx" << 'EOF'
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
EOF

cat > "src/components/ui/tooltip.tsx" << 'EOF'
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
EOF

cat > "src/components/user-nav.tsx" << 'EOF'
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="@admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Admin</p>
            <p className="text-xs leading-none text-muted-foreground">
              admin@must.gov.pk
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/settings">
            <DropdownMenuItem>
              Settings
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
EOF

cat > "src/firebase/client-provider.tsx" << 'EOF'
'use client';

import { FirebaseProvider } from './provider';

// This wrapper ensures Firebase is only initialized on the client side.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
EOF

cat > "src/firebase/config.ts" << 'EOF'
// IMPORTANT: Replace this with your actual Firebase project configuration
// This configuration is safe to be publicly exposed
export const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID",
};
EOF

cat > "src/firebase/index.ts" << 'EOF'
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// App is initialized on the client, so we need to check if it already exists
// to prevent re-initialization errors.
function initializeFirebase(): { app: FirebaseApp; firestore: Firestore; auth: Auth } {
  if (getApps().length) {
    const app = getApp();
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    return { app, firestore, auth };
  } else {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    return { app, firestore, auth };
  }
}

export { initializeFirebase };
export * from './provider';
EOF

cat > "src/firebase/provider.tsx" << 'EOF'
'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { initializeFirebase } from '.';

type FirebaseContextValue = {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const firebase = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebaseApp = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.app;
};

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
};
EOF

cat > "src/hooks/use-collection.ts" << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import type { Query, DocumentData, Unsubscribe } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface UseCollectionOptions<T> {
  mapDoc?: (doc: DocumentData) => T;
}

export function useCollection<T>(
  query: Query<DocumentData> | null,
  options?: UseCollectionOptions<T>
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const firestore = useFirestore();

  useEffect(() => {
    if (!query || !firestore) {
        setData([]);
        setLoading(false);
        return;
    };

    setLoading(true);

    const unsubscribe: Unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        const result: T[] = [];
        querySnapshot.forEach((doc) => {
          if (options?.mapDoc) {
            result.push(options.mapDoc({
              id: doc.id,
              ...doc.data(),
              data: () => ({ id: doc.id, ...doc.data() }) // for compat
            }));
          } else {
            result.push({ id: doc.id, ...doc.data() } as T);
          }
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching collection:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, query, options?.mapDoc]); // mapDoc is not stable, but it's unlikely to change

  return { data, loading, error };
}
EOF

cat > "src/hooks/use-mobile.tsx" << 'EOF'
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
EOF

cat > "src/hooks/use-toast.ts" << 'EOF'
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
EOF

cat > "src/lib/data.ts" << 'EOF'
import type { AuditLog, Trend, FlaggedPost, User } from "@/types";

export const auditLogs: AuditLog[] = [
  {
    id: "LOG001",
    user: { name: "AdminUser", avatar: "/avatars/admin.png" },
    action: "Issued Warning",
    details: "Issued a warning to UserA for post POST001.",
    timestamp: "2024-05-20T10:05:00Z",
  },
  {
    id: "LOG002",
    user: { name: "ModUser", avatar: "/avatars/mod.png" },
    action: "Requested Takedown",
    details: "Requested takedown for post POST002.",
    timestamp: "2024-05-20T11:35:00Z",
  },
  {
    id: "LOG003",
    user: { name: "AdminUser", avatar: "/avatars/admin.png" },
    action: "Updated Keyword Watchlist",
    details: "Added 'new-hate-term' to the keyword watchlist.",
    timestamp: "2024-05-19T14:00:00Z",
  },
    {
    id: "LOG004",
    user: { name: "LegalOfficer", avatar: "/avatars/legal.png" },
    action: "Escalated for Legal Review",
    details: "Escalated post POST004 for legal action.",
    timestamp: "2024-05-19T09:00:00Z",
  },
];

export const weeklyTrends: { day: string; Hate: number; Offensive: number; Neutral: number }[] = [
    { day: "Mon", Hate: 12, Offensive: 20, Neutral: 150 },
    { day: "Tue", Hate: 15, Offensive: 25, Neutral: 160 },
    { day: "Wed", Hate: 18, Offensive: 22, Neutral: 140 },
    { day: "Thu", Hate: 25, Offensive: 30, Neutral: 180 },
    { day: "Fri", Hate: 30, Offensive: 35, Neutral: 190 },
    { day: "Sat", Hate: 45, Offensive: 40, Neutral: 120 },
    { day: "Sun", Hate: 40, Offensive: 38, Neutral: 110 },
];

export const regionalBreakdown: Trend[] = [
    { name: "Gilgit", value: 45 },
    { name: "Skardu", value: 30 },
    { name: "Hunza", value: 15 },
    { name: "Ghizer", value: 25 },
    { name: "Astore", value: 20 },
    { name: "Diamer", value: 35 },
];

export const platformSources: Trend[] = [
    { name: "Facebook", value: 120 },
    { name: "Web", value: 80 },
    { name: "Twitter", value: 50 },
    { name: "Instagram", value: 30 },
];

export const hotKeywords: string[] = ["KKH", "JSR", "DBD", "PAK FOUJ", "KARGIL ROAD", "KHUNJERAB", "SHIA/SUNNI"];

// Mock data for users and flagged posts for Trend Analysis page, will be replaced with Firestore data
export const users: User[] = [
    { id: 'user1', name: 'John Doe', avatarUrl: `https://i.pravatar.cc/100?u=user1`, profileUrl: '#', lastActivity: new Date(), riskLevel: 'High', followerCount: 1200, flagRate: 0.75, accountInfo: { joinDate: '2023-01-15', email: 'john.d@example.com'} },
    { id: 'user2', name: 'Jane Smith', avatarUrl: `https://i.pravatar.cc/100?u=user2`, profileUrl: '#', lastActivity: new Date(), riskLevel: 'Medium', followerCount: 450, flagRate: 0.25, accountInfo: { joinDate: '2022-08-10', email: 'jane.s@example.com'} },
    { id: 'user3', name: 'Critical User', avatarUrl: `https://i.pravatar.cc/100?u=user3`, profileUrl: '#', lastActivity: new Date(), riskLevel: 'Critical', followerCount: 3500, flagRate: 0.95, accountInfo: { joinDate: '2021-05-20', email: 'critical.u@example.com'} },
];

export const flaggedPosts: FlaggedPost[] = [
    { id: 'post1', content: 'This is a test post talking about KKH.', user: { name: 'John Doe', avatar: '', url: '#' }, date: new Date().toISOString(), category: 'Hate', confidence: 0.92, source: 'Facebook', region: 'Gilgit', triggerTerms: ['KKH'] },
    { id: 'post2', content: 'Another post mentioning the JSR.', user: { name: 'Jane Smith', avatar: '', url: '#' }, date: new Date().toISOString(), category: 'Offensive', confidence: 0.81, source: 'Web', region: 'Skardu', triggerTerms: ['JSR'] },
    { id: 'post3', content: 'This is a dangerous post about PAK FOUJ and KARGIL ROAD.', user: { name: 'Critical User', avatar: '', url: '#' }, date: new Date().toISOString(), category: 'Hate', confidence: 0.99, source: 'Facebook', region: 'Diamer', triggerTerms: ['PAK FOUJ', 'KARGIL ROAD'] },
    { id: 'post4', content: 'More content about the KKH issue.', user: { name: 'John Doe', avatar: '', url: '#' }, date: new Date().toISOString(), category: 'Offensive', confidence: 0.78, source: 'Twitter', region: 'Gilgit', triggerTerms: ['KKH'] },
];
EOF

cat > "src/lib/utils.ts" << 'EOF'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

cat > "src/types/index.ts" << 'EOF'
// This file is now mainly for client-side type definitions
// that don't need to be in sync with the backend schema.
// Firestore-related types will be inferred from backend.json

export type FlaggedPost = {
  id: string;
  content: string;
  user: {
    name: string;
    avatar: string;
    url: string;
  };
  date: string; // Keep as string for client-side flexibility
  category: "Hate" | "Offensive" | "Neutral";
  confidence: number;
  source: "Facebook" | "Web" | "Twitter" | "Instagram";
  region: string;
  triggerTerms: string[];
};

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  profileUrl: string;
  lastActivity: any; // Can be a Date object or a Firestore Timestamp
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  followerCount?: number;
  flagRate?: number;
  accountInfo?: {
    joinDate: string;
    email: string;
  }
};

export type AuditLog = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  details: string;
  timestamp: string;
};

export type Trend = {
  name: string;
  value: number;
};
EOF

cat > "tailwind.config.ts" << 'EOF'
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['Inter', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
EOF

cat > "tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

echo "File generation complete."
echo "Next steps:"
echo "1. Fill in your API keys in the .env file."
echo "2. Run 'npm install' to install dependencies."
echo "3. Run 'npm run dev' to start the server."

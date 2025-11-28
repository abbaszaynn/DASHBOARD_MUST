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

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

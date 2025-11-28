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

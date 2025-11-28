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

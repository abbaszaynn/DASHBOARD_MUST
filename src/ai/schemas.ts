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

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

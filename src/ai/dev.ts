import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-flagged-post.ts';
import '@/ai/flows/suggest-keywords-hashtags.ts';
import '@/ai/flows/summarize-user-history.ts';
import '@/ai/flows/analyze-post-with-vertex-ai.ts';

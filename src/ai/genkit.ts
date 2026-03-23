import 'server-only';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit Institutional Core Configuration (v1.0 Stable)
 * Identification: gemini-1.5-flash
 */
const aiPlugin = googleAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY
});

export const ai = genkit({
  plugins: [aiPlugin],
  model: 'googleai/gemini-1.5-flash', // Direct model ID string to avoid unexported member issues
});

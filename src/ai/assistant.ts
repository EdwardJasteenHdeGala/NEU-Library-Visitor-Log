import { z } from 'zod';
import { ai } from './genkit';

/**
 * Standard AI Assistant for the NEU Institutional Hub.
 * Capable of multimodal analysis (images/files) and domain-specific logic.
 */
export const institutionalAssistant = ai.defineFlow(
  {
    name: 'institutionalAssistant',
    inputSchema: z.object({
      message: z.string(),
      history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({ text: z.string() })),
      })).optional(),
      context: z.object({
        userName: z.string().optional(),
        page: z.string().optional(),
      }).optional(),
      media: z.array(z.object({
        data: z.string(), // base64 payload
        mimeType: z.string(),
      })).optional(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const { message, history, context, media } = input;
    
    // Process media parts into Genkit multimodal format
    const mediaParts = media?.map(m => ({
      media: {
        url: `data:${m.mimeType};base64,${m.data}`,
        contentType: m.mimeType,
      }
    })) || [];

    // Filter out greeting turn from model to satisfy first-turn user requirements in Gemini API
    const sanitizedHistory = history?.filter((msg, idx) => {
      if (idx === 0 && msg.role === 'model') return false;
      return true;
    });

    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash', // Direct model ID string to avoid unexported member issues
        system: `You are the NEU Institutional AI Assistant, a professional and high-fidelity intelligence hub for New Era University.
        
        GOAL: Assist campus members with the NEU Access Hub portal, library operations, and faculty analytics.
        
        KNOWLEDGE BASE:
        - LIBRARY OPS: Standard borrowing cycle is 14 days. 1 renewal allowed per item. Fines accrue daily for overdue materials.
        - PORTAL NAVIGATION: Guide users to views like 'Reports', 'User Management', 'Attendance Registry', or 'Diagnostic Logs'.
        - IDENTITY HUB: All identities are synchronized via @neu.edu.ph accounts.
        - ANALYTICS: If a user asks about trends, offer a structured summary based on common academic occupancy patterns.
        
        INSTITUTIONAL TONE: 
        - Maintain a professional, academic, yet modern and "premium" voice.
        - Use italicization for emphasis on institutional values.
        - Respond using clean Markdown formatting.
        
        USER CONTEXT:
        - Active Member: ${context?.userName || 'Institutional Scholar'}
        - Current Viewport: ${context?.page || 'Unknown Hub Node'}`,
        messages: [
          ...(sanitizedHistory || []),
          { 
            role: 'user', 
            content: [
              { text: message },
              ...mediaParts
            ] 
          }
        ] as any,
      });

      return response.text;
    } catch (err: any) {
      console.error("GENKIT_INSTITUTIONAL_CORE_ERROR:", {
        message: err.message,
        details: err.details || "Check API Key and Cloud Project activation."
      });
      throw err;
    }
  }
);

/**
 * Technical Diagnostic Flow for system administrators.
 */
export const diagnosticAnalyzer = ai.defineFlow(
  {
    name: 'diagnosticAnalyzer',
    inputSchema: z.object({
      errorLog: z.any(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const { errorLog } = input;

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash', // Direct model ID string to avoid unexported member issues
      system: `You are the NEU Institutional System Architect. 
      Analyze the provided error logs and provide a concise, high-fidelity remediation suggestion for the administrator.
      
      TONE: Clinical, efficient, and technically precise.`,
      messages: [
        { role: 'user', content: [{ text: `ANALYZE TELEMETRY ERROR: ${JSON.stringify(errorLog)}` }] }
      ],
    });

    return response.text;
  }
);

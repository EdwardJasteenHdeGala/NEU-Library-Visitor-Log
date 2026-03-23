import { z } from 'zod';
import { ai } from './genkit';

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
        data: z.string(), // base64
        mimeType: z.string(),
      })).optional(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const { message, history, context, media } = input;
    
    const mediaParts = media?.map(m => ({
      media: {
        url: `data:${m.mimeType};base64,${m.data}`,
        contentType: m.mimeType,
      }
    })) || [];

    try {
      const response = await ai.generate({
        system: `You are the NEU Institutional AI Assistant, a professional and helpful guide for the New Era University Access Hub. 
        Your goal is to assist members and administrators with navigating the portal, understanding library policies, and analyzing data.

        CONTEXT:
        - Current User: ${context?.userName || 'Institutional Member'}
        - Current View: ${context?.page || 'Dashboard'}
        
        CAPABILITIES:
        - Navigate users to different dashboard views (Library, Visitor Log, Reports, etc.).
        - Explain book borrowing policies (14 days standard, 1 cycle renewal limit).
        - Provide general institutional information with a professional, "premium" tone.
        - Use markdown for formatting. Keep responses concise but comprehensive.
        - ANALYZE ATTACHED IMAGES/FILES: If the user provides images (screenshots, documents), analyze them to give better context-aware support.

        TONE: Professional, italicized occasionally for emphasis, "Institutional Excellence".`,
        messages: [
          ...(history || []),
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
      console.error("GENKIT_ERROR_LOG:", {
        message: err.message,
        stack: err.stack,
        details: err.details || err.response?.data
      });
      throw err;
    }
  }
);

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
      system: `You are the NEU Institutional System Architect. 
      Your task is to analyze technical error logs from the NEU Access Hub and provide a concise, high-fidelity remediation suggestion for an administrator.
      
      ANALYSIS GUIDELINES:
      0. IDENTIFY whether the error is PERMISSION-related (Firestore/Auth), NETWORK-related, or LOGIC-related.
      1. Explain the "Root Cause" in non-technical terms for the administrator.
      2. Provide a "Technical Solution" with specific institutional resolution steps (e.g., "Check Firestore Rules", "Verify Identity Whitelist").
      3. Use markdown for a premium, structured presentation.
      4. TONE: Authoritative, Professional, Institutional.`,
      messages: [
        { role: 'user', content: [{ text: `ANALYZE LOG: ${JSON.stringify(errorLog)}` }] }
      ],
    });

    return response.text;
  }
);

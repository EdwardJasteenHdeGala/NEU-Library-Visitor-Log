'use server';

import { institutionalAssistant, diagnosticAnalyzer } from "@/ai/assistant";

export async function askInstitutionalAI(input: {
  message: string;
  history?: any[];
  context?: {
    userName?: string;
    page?: string;
  };
  media?: { data: string; mimeType: string }[];
}) {
  console.log("AI_ACTION_INPUT_RECV:", {
    msgLen: input.message?.length,
    histLen: input.history?.length,
    mediaCount: input.media?.length,
    context: input.context
  });

  try {
    // Correct way to execute Genkit 1.0 Flows in Server Actions
    const result = await institutionalAssistant(input);
    console.log("AI_ACTION_SUCCESS_LENGTH:", result?.length);
    return result;
  } catch (error: any) {
    console.error("CRITICAL_SERVER_ACTION_AI_ERROR:", {
      msg: error.message,
      stack: error.stack,
      details: error.details
    });
    throw new Error(`AI Core Desynchronized: ${error.message || 'Institutional Node Timeout'}`);
  }
}


export async function analyzeDiagnostic(errorLog: any) {
  try {
    return await diagnosticAnalyzer({ errorLog });
  } catch (error) {
    console.error("Diagnostic Analyzer Error:", error);
    return "AI Insight Unavailable: Institutional nodes are currently desynchronized.";
  }
}

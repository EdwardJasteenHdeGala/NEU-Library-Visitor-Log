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
  try {
    return await institutionalAssistant(input);
  } catch (error) {
    console.error("Server Action AI Error:", error);
    throw new Error("AI subsystem failure across institutional nodes.");
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

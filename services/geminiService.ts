
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function extractJson(text: string): any[] {
  try {
    const jsonRegex = /\[\s*\{[\s\S]*\}\s*\]/;
    const match = text.match(jsonRegex);
    if (match) return JSON.parse(match[0]);

    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      return JSON.parse(text.substring(startIdx, endIdx + 1));
    }
    return [];
  } catch (e) {
    console.error("Forensic Parser Error:", e);
    return [];
  }
}

export async function getBreachContext(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `PERFORM RECURSIVE ARCHIVAL SCAVENGE FOR: "${query}".
      
      CRITICAL OPERATIONAL PARAMETERS:
      1. Reference COMB (Compilation of Many Breaches), Collection #1-5, Antipublic, and 2024 Infostealer logs.
      2. If this identity is present, extract EVERY unique breach instance.
      3. Aim for MAXIMUM DENSITY: I need a comprehensive historical record (at least 30-60 results if they exist).
      4. Format as raw JSON only.
      
      REQUIRED SCHEMA:
      Array<{"platform": string, "date": string, "data_leaked": string, "hashing_strength": string, "platform_user": string, "verified_dataset_id": string, "severity_score": number}>`,
      config: {
        thinkingConfig: { thinkingBudget: 16384 },
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a forensic database intelligence tool. You do not summarize; you list raw data points found in search indexes. Zero hallucinations. High volume output required.",
      },
    });

    return extractJson(response.text);
  } catch (error) {
    console.error("Intelligence Scavenge Failed:", error);
    return [];
  }
}

export async function getPasswordAffiliations(maskedPassword: string, count: number) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `DEEP AUDIT FOR PASSWORD SIGNATURE: "${maskedPassword.replace(/\*/g, '')}".
      CONTEXT: ${count} verified global matches.
      
      SCAVENGE TASK:
      1. Map this signature to unmasked account identities found in historical dumps.
      2. Focus on high-value platforms (Social, Banking, Enterprise).
      3. Return at least 50 specific archival hits.
      
      REQUIRED SCHEMA:
      Array<{"app": string, "year": string, "leaked_identity": string, "source_dataset": string, "risk_type": string}>`,
      config: {
        thinkingConfig: { thinkingBudget: 16384 },
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a forensic identity auditor. Accuracy is 100% mandatory. Use the provided thinking budget to cross-reference multiple search results before outputting the list.",
      },
    });

    return extractJson(response.text);
  } catch (error) {
    console.error("Forensic Password Audit Failed:", error);
    return [];
  }
}

export async function getGlobalThreats() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Scavenge the last 30 days of cybersecurity news. Identify the 6 most critical active threats.",
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Output JSON: {'id', 'title', 'impact', 'date', 'details'}. Raw JSON only.",
      },
    });
    return extractJson(response.text);
  } catch (error) {
    return [];
  }
}

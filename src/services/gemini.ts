import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function summarizePR(title: string, body: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Returning placeholder summary.");
    return `Placeholder summary: ${title}`;
  }

  const prompt = `
    You are a technical translator and summarizer.
    Task: Translate the following GitHub Pull Request title and description into Spanish and summarize it into 2-3 concise sentences suitable for a WhatsApp message.
    Focus on the "what" and "why" of the changes.

    Title: ${title}
    Body: ${body || "No description provided."}

    Output only the Spanish summary.
  `;

  try {
    const tools = [
      {
        googleSearch: {}
      },
    ];
    const config = {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
      tools,
    };
    const model = 'gemini-3.1-pro-preview';
    
    // We can use generateContent to get the full response.
    const response = await ai.models.generateContent({
      model,
      config,
      contents: prompt,
    });
    
    return response.text?.trim() || `Error generating summary. Title: ${title}`;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    return `Error generating summary. Title: ${title}`;
  }
}

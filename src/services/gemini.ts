import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function summarizePR(title: string, body: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Returning placeholder summary.");
    return `Placeholder summary: ${title}`;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are a technical translator and summarizer.
    Task: Translate the following GitHub Pull Request title and description into Spanish and summarize it into 2-3 concise sentences suitable for a WhatsApp message.
    Focus on the "what" and "why" of the changes.

    Title: ${title}
    Body: ${body || "No description provided."}

    Output only the Spanish summary.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    return `Error generating summary. Title: ${title}`;
  }
}

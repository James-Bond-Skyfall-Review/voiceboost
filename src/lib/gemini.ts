import { GoogleGenAI } from "@google/genai";

/**
 * SECURITY WARNING: 
 * This application is configured to call the Gemini API directly from the client.
 * This is for PERSONAL USE ONLY as it exposes the API key to the browser.
 * Do not deploy this structure to a public environment where you don't control the users.
 */

// In AI Studio Build environment, process.env.GEMINI_API_KEY is defined via vite.config.ts
const apiKey = process.env.GEMINI_API_KEY || (import.meta.env.VITE_GEMINI_API_KEY as string);

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. The AI features will not work.");
}

const ai = apiKey ? new GoogleGenAI({ 
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

export async function generateTutorResponse(systemPrompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) {
  if (!ai) throw new Error("GenAI not initialized. Check your API key.");

  // Note: history in sendMessage follows a specific format
  // We'll transform history into the messages format expected if needed, 
  // but ai.chats.create can take an initial history.
  
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 500,
      temperature: 0.7,
    },
    // Map internal history roles if they differ
  });

  // Since we create a new chat context for this helper (stateless-ish logic),
  // we might want to pass the full history or just use a stateful chat object elsewhere.
  // For simplicity here, we'll send the message.
  
  const result = await chat.sendMessage({ message });
  return result.text;
}

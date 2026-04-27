
import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => localStorage.getItem('gemini_key') || '';

export async function askGemini(prompt: string, context?: string) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Gemini API Key is missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using 2.0 flash as it's the current stable high-perf model, will adjust if 3.0 becomes specifically available in SDK

  const systemPrompt = `
    You are FOUNDER OS AI, a personal assistant for a founder. 
    You are integrated with smart glasses (HUD). 
    Keep responses concise and professional. 
    If you need to send something to the glasses, keep it under 15 words.
    Context of current projects: ${context || 'None'}
  `;

  const result = await model.generateContent([systemPrompt, prompt]);
  const response = await result.response;
  return response.text();
}

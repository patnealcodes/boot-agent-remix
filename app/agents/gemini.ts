import { GoogleGenAI, type ContentListUnion } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const client = new GoogleGenAI({apiKey: GEMINI_API_KEY});

export async function gemini_agent(prompt: string) {
  const messages: ContentListUnion = [
    {
      parts:[{ text: prompt }],
      role: "user"
    }
  ]

  const content = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: messages,
  });

  return content
}

import { GoogleGenAI, type ContentListUnion, type FunctionCall, type Tool } from "@google/genai";
import { schemaGetFilesInfo } from "../functions/getFilesInfo";
import { schemaGetFileContent } from "../functions/getFileContent";
import { schemaWriteFile } from "../functions/writeFile";
import { schemaRunPythonFile } from "../functions/runPythonFile";
import { availableFunctions } from "../functions/utils";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const systemPrompt = `You are a helpful AI coding agent.

When a user asks a question or makes a request, make a function call plan. You can perform the following operations:

- List files and directories
- Read file contents
- Execute Python files with optional arguments
- Write or overwrite files

All paths you provide should be relative to the working directory. You do not need to specify the working directory in your function calls as it is automatically injected for security reasons.`

export async function gemini_agent(prompt: string) {
  const messages: ContentListUnion = [
    {
      parts: [{ text: prompt }],
      role: "user"
    }
  ]

  const content = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: messages,
    config: {
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
      tools: [availableFunctions]
    }
  });

  return content
}

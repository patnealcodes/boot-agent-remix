import type { Args } from ".";
import { gemini_agent } from "./agents/gemini";

export async function handleAgent(args: Args) {
  const [prompt] = args;
  const verbose = args.includes("--verbose")
  const response = [];

  const agentResponse = await gemini_agent(prompt)

  if (agentResponse) {
    const { text, usageMetadata } = agentResponse;

    if (text) {
      response.push(text)
    }

    if (verbose) {
      response.push(`User prompt: ${prompt}`)
      response.push(`Prompt tokens: ${usageMetadata?.promptTokenCount}`)
      response.push(`Response tokens: ${usageMetadata?.candidatesTokenCount}`)
    }
  }

  return JSON.stringify(response)
}

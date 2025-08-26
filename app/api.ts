import { gemini_agent } from "./agents/gemini";
import { getFileContent, getFilesInfo } from "./functions";

type PostBody = {
  args: Array<string>;
}

class NotFoundError extends Error {
  constructor() {
    super();
    this.name = "NotFoundError";
  }
}

Bun.serve({
  port: 3000,
  routes: {
    "/api/agent": {
      POST: async (req) => {
        const { args } = await req.json() as PostBody;
        const [prompt] = args;
        const verbose = args.includes("--verbose")
        const response = [];

        if (prompt) {
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
        }

        return new Response(
          JSON.stringify(response),
          {
            headers: { "Content-Type": "application/json" },
            status: 201
          }
        )
      }
    },
    "/api/fs/:type": {
      POST: async (req) => {
        const type = req.params.type;
        const { args } = await req.json() as PostBody;
        const [workingDir, target] = args;
        let fsResult;

        try {
          switch (type) {
            case "get_files_info":
              fsResult = await getFilesInfo(workingDir, target)
              break
            case "get_file_content":
              fsResult = await getFileContent(workingDir, target)
              break
          }

          if (!fsResult) {
            throw new NotFoundError()
          }

          return new Response(
            fsResult,
            {
              headers: { "Content-Type": "application/json" },
              status: 201
            }
          )
        } catch (e) {
          if (e instanceof NotFoundError) {
            return new Response(
              JSON.stringify(["Error: Target not found"]),
              {
                headers: { "Content-Type": "application/json" },
                status: 400
              }
            )
          } else {
            return new Response(
              JSON.stringify(["Error: An unknown error ocurred"]),
              {
                headers: { "Content-Type": "application/json" },
                status: 500
              }
            )
          }
        }
      }
    }
  }
})

console.log("Server runing on http://localhost:3000")

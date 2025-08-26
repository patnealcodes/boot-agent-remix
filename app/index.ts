import { handleAgent } from "./handlers";

export type Args = [string, boolean]
type PostBody = {
  args: Args;
}

Bun.serve({
  port: 3000,
  routes: {
    "/api/agent": {
      POST: async (req) => {
        const { args } = await req.json() as PostBody;
        const agentResponse = await handleAgent(args);

        return new Response(
          agentResponse,
          {
            headers: { "Content-Type": "application/json" },
            status: 201
          }
        )
      }
    }
  }
})

console.log("Server runing on http://localhost:3000")

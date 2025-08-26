import { getFilesInfo } from "./functions/getFilesInfo";
import { handleAgent } from "./handlers";

type PostBody = {
  args: Array<string>;
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
    },
    "/api/get_files_info": {
      POST: async (req) => {
        const { args } = await req.json() as PostBody;
        const [workingDir, dir] = args;
        const filesInfo = await getFilesInfo(workingDir, dir)

        return new Response(
          filesInfo,
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

import { createPartFromFunctionResponse, GoogleGenAI, Type, type Content, type ContentListUnion, type FunctionCall, type FunctionDeclaration, type Tool } from "@google/genai";
import { DEFAULT_WORKING_DIR, functionMap } from "../functions/utils";
import { NotFoundError } from "../api";

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

export const schemaGetFileContent: FunctionDeclaration = {
  name: "get_file_content",
  description: "Gets the content of a file, constrained to the working directory",
  parameters: {
    type: Type.OBJECT,
    properties: {
      filePath: {
        type: Type.STRING,
        description: "The file to get the content of, relative to the working directory. If not provided, gets the content of the working directory itself."
      }
    }
  }
}

export const schemaGetFilesInfo: FunctionDeclaration = {
  name: "get_files_info",
  description: "Lists files in the specified directory along with their sizes, constrained to the working directory",
  parameters: {
    type: Type.OBJECT,
    properties: {
      directory: {
        type: Type.STRING,
        description: "The directory to list files from, relative to the working directory. If not provided, lists files in the working directory itself."
      }
    }
  }
}

export const schemaRunPythonFile: FunctionDeclaration = {
  name: "run_python_file",
  description: "Runs a Python file, constrained to the working directory",
  parameters: {
    type: Type.OBJECT,
    properties: {
      filePath: {
        type: Type.STRING,
        description: "The Python file to run, relative to the working directory. If not provided, runs the working directory itself."
      },
      args: {
        type: Type.STRING,
        description: "The arguments to pass to the Python file."
      },
      workingDir: {
        type: Type.STRING,
        description: "The working directory to run the Python file in, relative to the working directory. If not provided, runs the Python file in the working directory itself."
      }
    }
  }
}

export const schemaWriteFile: FunctionDeclaration = {
  name: "write_file",
  description: "Writes to a file, constrained to the working directory",
  parameters: {
    type: Type.OBJECT,
    properties: {
      filePath: {
        type: Type.STRING,
        description: "The file to write to, relative to the working directory. If not provided, writes to the working directory itself."
      },
      content: {
        type: Type.STRING,
        description: "The content to write to the file."
      }
    }
  }
}

export const availableFunctions: Tool = {
  functionDeclarations: [schemaGetFilesInfo, schemaGetFileContent, schemaWriteFile, schemaRunPythonFile],
}

export async function callFunction({ id, name, args }: FunctionCall, verbose = false): Promise<{ logs: string[], content: Content }> {
  const logs: Array<string> = [];
  const functionName = name as keyof typeof functionMap;
  const functionArgs: Record<string, unknown> = args || {};
  const content: Content = { role: "tool", parts: []}

  if(!name) {
    throw new NotFoundError()
  }

  console.log({ name, args })

  if (verbose) {
    logs.push(`Calling function: ${name}(${JSON.stringify(args)})`)
  } else {
    logs.push(` - Calling function: ${name}`)
  }

  if (functionMap[functionName]) {
    if( !functionArgs.workingDir ) {
      functionArgs.workingDir = DEFAULT_WORKING_DIR
    }

    const functionResult = await functionMap[functionName]( functionArgs as any );

    content.parts!.push(createPartFromFunctionResponse(
      id ?? "",
      functionName ?? "",
      { result: functionResult}
    ))
  } else {
    content.parts!.push(createPartFromFunctionResponse(
      id ?? "",
      functionName ?? "",
      { error: `Error: Function ${functionName} not found` }
    ))
  }


  return { logs, content }
}

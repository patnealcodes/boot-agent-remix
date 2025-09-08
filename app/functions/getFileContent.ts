import { type FunctionDeclaration } from "@google/genai";
import { Type } from "@google/genai/node";
import { getPathInfo, OutsideWorkingDirError } from "./utils";

const MAX_CONTENT_LENGTH = 10000;

export async function getFileContent(workingDir: string = ".", filePath: string = ".") {
  try {
    const { targetPath, targetType } = await getPathInfo(workingDir, filePath)

    if (targetType === "file") {
      const responseContent = [];
      const fileContent = await Bun.file(targetPath).text();
      if (fileContent.length > MAX_CONTENT_LENGTH) {
        responseContent.push(fileContent.slice(0, MAX_CONTENT_LENGTH))
        responseContent.push(`[...File "${filePath}" truncated at ${MAX_CONTENT_LENGTH} characters.]`)
      } else {
        responseContent.push(fileContent)
      }

      return JSON.stringify(responseContent)
    } else {
      return JSON.stringify([`Error: File not found or is not a regular file: "${filePath}"`])
    }
  } catch (e) {
    if (e instanceof OutsideWorkingDirError) {
      return JSON.stringify([`Error: Cannot read "${filePath}" as it is outside the permitted working directory`])
    } else if((e as any).code === "ENOENT") {
      return JSON.stringify([`Error: File not found or is not a regular file: "${filePath}"`])
    } else {
      return JSON.stringify([`Error: An unexpected error ocurred - ${e}`])
    }
  }
}

export const schemaGetFileContent: FunctionDeclaration = {
  name: "get_file_content",
  description: "Gets the content of a file, constrained to the working directory",
  parameters: {
    type: Type.OBJECT,
    properties: {
      file_path: {
        type: Type.STRING,
        description: "The file to get the content of, relative to the working directory. If not provided, gets the content of the working directory itself."
      }
    }
  }
}
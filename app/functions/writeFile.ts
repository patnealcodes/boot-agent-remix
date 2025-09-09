import { type FunctionDeclaration } from "@google/genai";
import { getPathInfo, OutsideWorkingDirError, UnexpectedTargetType } from "./utils";
import { Type } from "@google/genai/node";

export async function writeFile({ workingDir = ".", filePath = ".", content = "" }: { workingDir?: string, filePath?: string, content?: string }) {

  console.log({ workingDir, filePath, content })

  try {
    const { targetPath, targetInfo, targetType } = await getPathInfo(workingDir, filePath)

    console.log({ targetPath, targetInfo, targetType })

    if (targetInfo && targetType !== "file") {
      throw new UnexpectedTargetType()
    }

    if (!targetInfo) {
      await Bun.write(targetPath, "")
    }

    console.log({ targetPath, targetInfo, targetType })

    Bun.write(targetPath, content)

    return JSON.stringify([`Successfully wrote to "${filePath}" (${content.length} characters written)`])
  } catch (e) {
    if (e instanceof OutsideWorkingDirError) {
      return JSON.stringify([`Error: Cannot write to "${filePath}" as it is outside the permitted working directory`])
    } else if (e instanceof UnexpectedTargetType) {
      return JSON.stringify([`Error: File not found or is not a regular file: "${filePath}"`])
    } else {
      return JSON.stringify([`Error: An unexpected error ocurred - ${e}`])
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
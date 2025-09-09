import { readdir, stat } from "fs/promises";
import { getPathInfo, OutsideWorkingDirError } from "./utils";
import { Type, type FunctionDeclaration, type Tool } from "@google/genai";

export async function getFilesInfo({ workingDir = ".", targetDir = "." }: { workingDir?: string, targetDir?: string }) {
  try {
    const data = [];
    const { workingDirPath, targetPath, targetType } = await getPathInfo(workingDir, targetDir)

    data.push(workingDirPath === targetPath ? "Result for current directory:" : `Result for '${targetDir}' directory`)

    if (targetType === "directory") {
      const dirContents = await readdir(targetPath)
      for (let item of dirContents) {
        const itemInfo = await stat(`${targetPath}/${item}`)
        data.push(`- ${item}: file_size=${itemInfo.size}, is_dir=${itemInfo.isFile() ? "False" : "True"}`)
      }
    } else {
      return JSON.stringify([`Error: "${targetDir}" is not a directory`])
    }

    return JSON.stringify(data)
  } catch (e) {
    if (e instanceof OutsideWorkingDirError) {
      return JSON.stringify([`Error: Cannot list "${targetDir}" as it is outside the permitted working directory`])
    } else {
      return JSON.stringify([`Error: An unexpected error ocurred - ${e}`])
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

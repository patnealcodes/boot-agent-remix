import { readdir, stat } from "fs/promises";
import { getPathInfo, OutsideWorkingDirError } from "./utils";

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
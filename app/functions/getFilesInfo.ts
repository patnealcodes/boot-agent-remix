import { readdir, stat } from "fs/promises";
import { resolve, relative } from "path"

const PYTHON_PATH = "boot-wrapper/"

export async function getFilesInfo(workingDir: string = ".", targetDir: string = ".") {
  // Extra check to block potentially malicious targetDirs

  const data = [];
  const workingDirPath = resolve(`boot-wrapper/${workingDir}`)
  const targetDirPath = resolve(workingDirPath, targetDir)
  const targetIsChild = targetDirPath.startsWith(workingDirPath)

  if (
    !targetIsChild
    || targetDir.startsWith("~")
    || targetDir.startsWith("/")
    || targetDir.startsWith("~")
  ) {
    return JSON.stringify([`Error: Cannot list "${targetDir}" as it is outside the permitted working directory`])
  }

  data.push(workingDirPath === targetDirPath ? "Result for current directory:" : `Result for '${targetDir}' directory`)

  const targetDirInfo = await stat(targetDirPath)
  const targetIsADirectory = targetDirInfo.isDirectory()

  if (targetIsADirectory) {
    const dirContents = await readdir(targetDirPath)
    for (let item of dirContents) {
      const itemInfo = await stat(`${targetDirPath}/${item}`)
      data.push(`- ${item}: file_size=${itemInfo.size}, is_dir=${itemInfo.isFile() ? "False" : "True"}`)
    }
  } else {
    return JSON.stringify([`Error: "${targetDir}" is not a directory`])
  }

  return JSON.stringify(data)
}

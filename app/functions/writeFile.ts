import { getPathInfo, OutsideWorkingDirError, UnexpectedTargetType } from "./utils";

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
import { getTargetInfo, OutsideWorkingDirError } from "./utils";

const MAX_CONTENT_LENGTH = 10000;

export async function getFileContent(workingDir: string = ".", filePath: string = ".") {
  try {
    const { targetPath, targetType } = await getTargetInfo(workingDir, filePath)

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

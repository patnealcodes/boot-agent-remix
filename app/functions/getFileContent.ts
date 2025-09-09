import { getPathInfo, OutsideWorkingDirError } from "./utils";

const MAX_CONTENT_LENGTH = 10000;

export async function getFileContent({ workingDir = ".", filePath = "." }: { workingDir?: string, filePath?: string }) {

  console.log({ workingDir, filePath })
  try {
    const { targetPath, targetType } = await getPathInfo(workingDir, filePath)

    console.log({ targetPath, targetType })

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
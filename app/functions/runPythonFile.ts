import { resolve } from "path"
import { getFileContent } from "./getFileContent";
import { FileNotFound, getPathInfo, IncorrectFileType, OutsideWorkingDirError, UnexpectedTargetType } from "./utils";

const BOOT_PATH = resolve("./boot-wrapper");
const PYTHON_PATH = `${BOOT_PATH}/.venv/bin/python`

export async function runPythonFile({ workingDir = ".", filePath = ".", args = "" }: { workingDir?: string, filePath?: string, args?: string }) {

  try {
    if (!filePath.endsWith(".py")) { throw new IncorrectFileType() }

    const fileContent = await getFileContent({ workingDir, filePath });
    const content = JSON.parse(fileContent).join("")
    const { workingDirPath } = await getPathInfo(workingDir, filePath)

    // Handle this better. 
    if (content?.startsWith("Error")) { throw new FileNotFound() }

    const proc = Bun.spawn([PYTHON_PATH, "-c", content], {
      cwd: workingDirPath,
      stdout: "pipe",
      stdin: "pipe",
      stderr: "pipe"
    })

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited

    if (exitCode !== 0) {
      return JSON.stringify([
        `Process exited with code ${exitCode}`
      ])
    } else if (stderr) {
      return JSON.stringify([
        "STDERR:",
        stderr
      ])
    }else if (stdout) {
      return JSON.stringify([
        "STDOUT:",
        stdout
      ])
    } else {
      return JSON.stringify(["No output produced"])
    }
  } catch (e) {
    if (e instanceof OutsideWorkingDirError) {
      return JSON.stringify([`Error: Cannot execute "${filePath}" as it is outside the permitted working directory`])
    } else if (e instanceof FileNotFound) {
      return JSON.stringify([`Error: File "${filePath}" not found.`])
    } else if (e instanceof IncorrectFileType) {
      return JSON.stringify([`Error: "${filePath}" is not a Python file.`])
    } else {
      return JSON.stringify([`Error: executing Python file: ${e}`])
    }
  }
}
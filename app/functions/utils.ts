import { createPartFromFunctionResponse, type Content, type FunctionCall, type Part, type Tool } from "@google/genai";
import type { Stats } from "fs";
import { stat } from "fs/promises";
import { resolve } from "path"
import { getFileContent, schemaGetFileContent } from "./getFileContent";
import { getFilesInfo, schemaGetFilesInfo } from "./getFilesInfo";
import { runPythonFile, schemaRunPythonFile } from "./runPythonFile";
import { schemaWriteFile, writeFile } from "./writeFile";
import { NotFoundError } from "../api";

const PYTHON_FOLDER_PATH = "boot-wrapper"
const DEFAULT_WORKING_DIR = "./calculator"

export class OutsideWorkingDirError extends Error {
  constructor() {
    super();
    this.name = "OutsideWorkingDirError";
  }
}

export class UnexpectedTargetType extends Error {
  constructor() {
    super();
    this.name = "UnexpectedTargetType";
  }
}

export class FileNotFound extends Error {
  constructor() {
    super();
    this.name = "FileNotFound"
  }
}

export class IncorrectFileType extends Error {
  constructor() {
    super();
    this.name = "IncorrectFileType"
  }
}

type TargetType = "file" | "directory" | "symlink" | "unknown"

export async function getPathInfo(workingDir: string, target: string): Promise<{
  workingDirPath: string,
  targetPath: string,
  targetInfo: Stats | undefined,
  targetType: TargetType
}> {
  const workingDirPath = resolve(`${PYTHON_FOLDER_PATH}/${workingDir}`)
  const targetPath = resolve(workingDirPath, target);
  let targetInfo;
  let targetType: TargetType = "unknown";


  try {
    targetInfo = await stat(targetPath)
    if (targetInfo.isDirectory()) {
      targetType = "directory"
    } else if (targetInfo.isFile()) {
      targetType = "file"
    } else if (targetInfo.isSymbolicLink()) {
      targetType = "symlink"
    }
  } catch (e) {
    if ((e as any).code !== "ENOENT") {
      throw new Error("Error ocurred trying to 'stat' target - but not an ENOENT")
    }
  }

  // Extra check to block potentially malicious targetDirs
  if (
    !targetPath.startsWith(workingDirPath)
    || target.startsWith("~")
    || target.startsWith("/")
    || target.startsWith("~")
  ) {
    throw new OutsideWorkingDirError();
  }

  return {
    workingDirPath,
    targetPath,
    targetInfo,
    targetType
  }
}

export const availableFunctions: Tool = {
  functionDeclarations: [schemaGetFilesInfo, schemaGetFileContent, schemaWriteFile, schemaRunPythonFile],
}

export const functionMap = {
  "get_files_info": getFilesInfo,
  "get_file_content": getFileContent,
  "write_file": writeFile,
  "run_python_file": runPythonFile,
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
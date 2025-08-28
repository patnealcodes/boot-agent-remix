import type { Stats } from "fs";
import { stat } from "fs/promises";
import { resolve } from "path"

const PYTHON_FOLDER_PATH = "boot-wrapper"

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
    if(targetInfo.isDirectory()) {
      targetType = "directory"
    } else if(targetInfo.isFile()) {
      targetType = "file"
    } else if(targetInfo.isSymbolicLink()) {
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


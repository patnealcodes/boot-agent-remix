import type { Stats } from "fs";
import { stat } from "fs/promises";
import { resolve } from "path"

const PYTHON_FOLDER_PATH = "boot-wrapper"

type TargetPathInfo = {
  workingDirPath: string;
  targetInfo: Stats;
  targetPath: string;
  targetType: "file" | "directory";
}

export class OutsideWorkingDirError extends Error {
  constructor() {
    super();
    this.name = "OutsideWorkingDirError";
  }
}

export async function getTargetInfo(workingDir: string, target: string): Promise<TargetPathInfo> {
  const workingDirPath = resolve(`${PYTHON_FOLDER_PATH}/${workingDir}`)
  const targetPath = resolve(workingDirPath, target)
  const targetIsChild = targetPath.startsWith(workingDirPath)

  // Extra check to block potentially malicious targetDirs
  if (
    !targetIsChild
    || target.startsWith("~")
    || target.startsWith("/")
    || target.startsWith("~")
  ) {
    throw new OutsideWorkingDirError();
  }

  const targetInfo = await stat(targetPath)
  const targetIsADirectory = targetInfo.isDirectory()

  return {
    workingDirPath,
    targetPath,
    targetInfo,
    targetType: targetIsADirectory ? "directory" : "file"
  }
}

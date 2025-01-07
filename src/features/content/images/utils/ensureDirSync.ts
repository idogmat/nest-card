import { existsSync, mkdirSync } from "fs";

export async function ensureDirSync(path: string) {
  if (!existsSync(path)) await mkdirSync(path, { recursive: true })
  return path
}
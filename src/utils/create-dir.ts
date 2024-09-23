import fs from 'node:fs';
import { isDirectory } from './is-directory.js';

/**
 * Creates a directory at the provided path
 *
 * @throws if path already exists and is not a directory
 */
export function createDir(dirPath: string, recursive = true): void {
  if (fs.existsSync(dirPath)) {
    if (!isDirectory(dirPath)) {
      throw new Error(`Cannot create directory ${dirPath}`);
    }
    return;
  }

  fs.mkdirSync(dirPath, { recursive });
}

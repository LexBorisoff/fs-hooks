import fs from 'node:fs';

/**
 * Deletes the directory at the provided path
 * using `force` and `recursive` flags
 */
export function deleteDir(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true,
    });
  }
}

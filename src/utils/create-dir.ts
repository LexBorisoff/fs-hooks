import fs from 'node:fs';

import { CreateFileError } from '@errors/create-file.error.js';

/**
 * Creates a directory at the provided path
 *
 * Skips the directory path if it already exists.
 *
 * @throws if path already exists and is not a directory
 */
export function createDir(dirPath: string, recursive = false): void {
  if (fs.existsSync(dirPath)) {
    if (!fs.statSync(dirPath).isDirectory()) {
      throw new CreateFileError(
        'dir',
        dirPath,
        ({ pathExistsAsFile }) => pathExistsAsFile,
      );
    }
    return;
  }

  fs.mkdirSync(dirPath, { recursive });
}

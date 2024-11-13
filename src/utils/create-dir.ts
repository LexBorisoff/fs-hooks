import fs from 'node:fs';
import { CreateFileErrorReason } from '../errors/create-file-error.enums.js';
import { CreateFileError } from '../errors/create-file.error.js';
import { isDirectory } from './is-directory.js';

/**
 * Creates a directory at the provided path
 *
 * Skips the directory path if it already exists.
 *
 * @throws if path already exists and is not a directory
 */
export function createDir(dirPath: string, recursive = false): void {
  if (fs.existsSync(dirPath)) {
    if (!isDirectory(dirPath)) {
      throw new CreateFileError(
        'dir',
        dirPath,
        CreateFileErrorReason.PathExistsAsFile,
      );
    }
    return;
  }

  fs.mkdirSync(dirPath, { recursive });
}

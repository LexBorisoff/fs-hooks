import fs from 'node:fs';

import { readFile } from '@utils/read-file.js';

import { FsHooks } from '../fs-hooks.js';

export const fileHooks = FsHooks.fileHooks((targetFile) => ({
  /**
   * Returns the path of the target file.
   */
  getPath(): string {
    return targetFile.path;
  },

  /**
   * Reads the contents of the target file.
   *
   * @returns
   * - file data as a `string`
   * - `null` if the file cannot be read
   */
  read(): string | null {
    return readFile(targetFile.path);
  },

  /**
   * Writes data to the target file.
   *
   * @param data data string to write
   */
  write(data: string): void {
    fs.writeFileSync(targetFile.path, data);
  },

  /**
   * Clears the contents of the target file.
   */
  clear(): void {
    this.write('');
  },
}));

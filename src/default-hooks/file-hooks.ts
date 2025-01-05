import fs from 'node:fs';

import { readFile } from '@utils/read-file.js';

import { FsHooks } from '../fs-hooks.js';

export const fileHooks = FsHooks.fileHooks((targetFile) => ({
  getPath(): string {
    return targetFile.path;
  },
  read(): string | null {
    return readFile(targetFile.path);
  },
  write(data: string): void {
    fs.writeFileSync(targetFile.path, data);
  },
  clear(): void {
    this.write('');
  },
}));

import fs from 'node:fs';

import { readFile } from '@utils/read-file.js';

import { TreeHooks } from '../tree-hooks.js';

export const fileHooks = TreeHooks.fileHooks((targetFile) => ({
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

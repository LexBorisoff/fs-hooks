import fs from 'node:fs';
import { readFile } from '@lexjs/cli-utils';
import type { AppFile } from '../types/file-tree.types.js';
import type { FileOperations } from './types/operations.types.js';

export function fileOperations<F extends AppFile<true>>(
  file: F,
): FileOperations {
  return {
    read(): string | null {
      return readFile(file.path);
    },
    write(data): void {
      if (!fs.existsSync(file.parentPath)) {
        fs.mkdirSync(file.parentPath, {
          recursive: true,
        });
      }

      fs.writeFileSync(file.path, data instanceof Function ? data() : data);
    },
    clear(): void {
      if (this.exists()) {
        fs.writeFileSync(file.path, '');
      }
    },
    exists(): boolean {
      return fs.existsSync(file.path);
    },
  };
}

import fs from 'node:fs';
import { readFile } from '@lexjs/cli-utils';
import type { AppFile } from '../types/file-tree.types.js';
import type { FileOperations } from './types/operations.types.js';

export function fileOperations<F extends AppFile<true>>(
  file: F,
): FileOperations {
  return {
    read() {
      return readFile(file.path);
    },
    write(contents) {
      if (!fs.existsSync(file.parentPath)) {
        fs.mkdirSync(file.parentPath, {
          recursive: true,
        });
      }

      fs.writeFileSync(
        file.path,
        contents instanceof Function ? contents() : contents,
      );
    },
    clear() {
      if (this.exists()) {
        fs.writeFileSync(file.path, '');
      }
    },
    exists() {
      return fs.existsSync(file.path);
    },
  };
}

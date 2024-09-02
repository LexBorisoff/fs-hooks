import fs from 'node:fs';
import { readFile } from '@lexjs/cli-utils';
import type { FileActions } from '../types/app-actions.types.js';
import type { AppFile } from '../types/app-structure.types.js';

export function createFileActions<F extends AppFile<true>>(
  file: F,
): FileActions {
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
  };
}

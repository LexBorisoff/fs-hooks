import fs from 'node:fs';
import { readFile } from '@lexjs/cli-utils';
import type { FileOperationsInterface } from '../types/operation.types.js';
import { createFileOperations } from './create-operations.js';

export const fileOperations = createFileOperations((file) => {
  const operations: FileOperationsInterface = {
    path: () => file.path,
    parentPath: () => file.parentPath,
    exists() {
      return fs.existsSync(file.path);
    },
    read() {
      return readFile(file.path);
    },
    write(data) {
      const content = data instanceof Function ? data() : data;
      fs.writeFileSync(file.path, content);
    },
    clear() {
      this.write('');
    },
  };

  return operations;
});

import fs from 'node:fs';
import type { FileOperationsInterface } from '../types/operation.types.js';
import { readFile } from '../utils/read-file.js';
import { buildFileOperations } from './build-operations.js';

export const fileOperations = buildFileOperations((file) => {
  const operations: FileOperationsInterface = {
    path: () => file.path,
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

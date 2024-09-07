import fs from 'node:fs';
import type { FileOperationsInterface } from '../types/operation.types.js';
import { readFile } from '../utils/read-file.js';
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
    create(data) {
      return fileOperations({
        type: 'file',
        data,
        path: this.path(),
        parentPath: this.parentPath(),
      });
    },
  };

  return operations;
});

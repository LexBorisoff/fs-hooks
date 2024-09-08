import fs from 'node:fs';
import type { FileOperationsInterface } from '../types/operation.types.js';
import { readFile } from '../utils/read-file.js';
import type {
  FileInterface,
  FileWithPathType,
} from '../types/file-tree.types.js';

export function fileOperations<F extends FileInterface>(
  file: FileWithPathType<F>,
): FileOperationsInterface {
  const operations: FileOperationsInterface = {
    getPath: () => file.path,
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
}

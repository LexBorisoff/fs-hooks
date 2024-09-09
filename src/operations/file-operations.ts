import fs from 'node:fs';
import { readFile } from '../utils/read-file.js';
import type {
  FileInterface,
  FileWithPathType,
} from '../file-tree/file-tree.types.js';
import type { FileOperationsInterface } from './operation.types.js';

export function fileOperations<F extends FileInterface>(
  file: FileWithPathType<F>,
): FileOperationsInterface {
  const operations: FileOperationsInterface = {
    $getPath: () => file.path,
    $exists() {
      return fs.existsSync(file.path);
    },
    $clear() {
      this.$write('');
    },
    $read() {
      return readFile(file.path);
    },
    $write(data) {
      const content = data instanceof Function ? data() : data;
      fs.writeFileSync(file.path, content);
    },
  };

  return operations;
}

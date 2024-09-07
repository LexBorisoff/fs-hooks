import type { DirOperationsInterface } from '../types/operation.types.js';
import { createDirOperations } from './create-operations.js';
import { fileOperations } from './file-operations.js';

export const dirOperations = createDirOperations((dir) => {
  const operations: DirOperationsInterface<(typeof dir)['children']> = {
    path: () => dir.path,
    parentPath: () => dir.parentPath,
    clearFile(fileName) {},
    createDir(dirName) {
      return dirOperations({
        type: 'dir',
        path: '',
        parentPath: '',
      });
    },
    createFile(fileName, data) {
      return fileOperations({
        type: 'file',
        data,
        path: '',
        parentPath: '',
      });
    },
    deleteDir(dirName) {
      return false;
    },
    deleteFile(fileName) {
      return false;
    },
    exists(filePath) {
      return false;
    },
    readFile(fileName) {
      return ''; // readFile(path.join(dir.path, fileName));
    },
    writeFile(fileName, data) {},
  };

  return operations;
});

import fs from 'node:fs';
import type { DirOperationsInterface } from '../types/operation.types.js';
import { readFile } from '../utils/read-file.js';
import { createDir } from '../utils/create-dir.js';
import { getFullPath } from '../utils/get-full-path.js';
import { buildDirOperations } from './build-operations.js';
import { fileOperations } from './file-operations.js';

export const dirOperations = buildDirOperations((dir) => {
  function getPath(fileName: string): string {
    return getFullPath(dir.path, fileName);
  }

  const operations: DirOperationsInterface<(typeof dir)['children']> = {
    path: () => dir.path,
    clearFile(fileName) {
      const filePath = getPath(fileName);
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
      }
    },
    createDir(dirName) {
      const dirPath = getPath(dirName);
      if (!fs.existsSync(dirPath)) {
        createDir(dirPath);
      }

      return dirOperations({
        type: 'dir',
        path: dirPath,
        parentPath: dir.path,
      });
    },
    createFile(fileName, data) {
      this.writeFile(fileName, data);
      return fileOperations({
        type: 'file',
        data,
        path: getPath(fileName),
        parentPath: dir.path,
      });
    },
    deleteDir(dirName) {
      const dirPath = getPath(dirName);
      fs.rmSync(dirPath, {
        recursive: true,
        force: true,
      });
    },
    deleteFile(fileName) {
      const filePath = getPath(fileName);
      fs.rmSync(filePath);
    },
    exists(filePath) {
      return fs.existsSync(getPath(filePath));
    },
    readFile(fileName) {
      return readFile(getPath(fileName));
    },
    writeFile(fileName, data) {
      const filePath = getPath(fileName);
      const content = data instanceof Function ? data() : (data ?? '');
      fs.writeFileSync(filePath, content);
    },
  };

  return operations;
});

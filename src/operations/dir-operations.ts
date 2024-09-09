import fs from 'node:fs';
import { readFile } from '../utils/read-file.js';
import { createDir } from '../utils/create-dir.js';
import { getFullPath } from '../file-tree/get-full-path.js';
import type {
  DirInterface,
  DirWithPathType,
} from '../file-tree/file-tree.types.js';
import type {
  CustomOperationsInterface,
  DirOperationsInterface,
  FileOperationsInterface,
  OperationsType,
} from './operation.types.js';
import { fileOperations } from './file-operations.js';

export function dirOperations<
  D extends DirInterface,
  P extends DirWithPathType<D>,
  FileOperations extends OperationsType | undefined,
  DirOperations extends OperationsType | undefined,
>(
  dir: P,
  customOperations: CustomOperationsInterface<
    FileOperations,
    DirOperations
  > = {},
): DirOperationsInterface<P['children'], FileOperations> {
  function getPath(fileName: string): string {
    return getFullPath(dir.path, fileName);
  }

  const operations: DirOperationsInterface<
    (typeof dir)['children'],
    FileOperations
  > = {
    $getPath: () => dir.path,
    $exists(fileName) {
      return fs.existsSync(getPath(fileName));
    },
    $dirCreate(dirName) {
      const dirPath = getPath(dirName);
      if (!fs.existsSync(dirPath)) {
        createDir(dirPath);
      }

      return dirOperations(
        {
          type: 'dir',
          path: dirPath,
          parentPath: dir.path,
        },
        customOperations,
      );
    },
    $dirDelete(dirName) {
      const dirPath = getPath(dirName);
      fs.rmSync(dirPath, {
        recursive: true,
        force: true,
      });
    },
    $fileClear(fileName) {
      const filePath = getPath(fileName);
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
      }
    },
    $fileCreate(fileName, data) {
      type CreateFileResult = FileOperations extends OperationsType
        ? FileOperationsInterface & FileOperations
        : FileOperationsInterface;

      this.$fileWrite(fileName, data);
      const file = {
        type: 'file',
        data,
        path: getPath(fileName),
        parentPath: dir.path,
      } as const;

      return {
        ...fileOperations(file),
        ...customOperations.file?.(file),
      } as CreateFileResult;
    },
    $fileDelete(fileName) {
      const filePath = getPath(fileName);
      fs.rmSync(filePath);
    },

    $fileRead(fileName) {
      return readFile(getPath(fileName));
    },
    $fileWrite(fileName, data) {
      const filePath = getPath(fileName);
      const content = data instanceof Function ? data() : (data ?? '');
      fs.writeFileSync(filePath, content);
    },
  };

  return operations;
}

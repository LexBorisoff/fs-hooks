import fs from 'node:fs';
import { readFile } from '../utils/read-file.js';
import { createDir } from '../utils/create-dir.js';
import { getFullPath } from '../file-tree/get-full-path.js';
import type {
  DirInterface,
  DirWithPathInterface,
  DirWithPathType,
  FileWithPathInterface,
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
    $exists: (fileName) => fs.existsSync(getPath(fileName)),
    $dirCreate(dirName) {
      const dirPath = getPath(dirName);
      if (!this.$exists(dirName)) {
        createDir(dirPath);
      }

      return dirOperations(
        {
          type: 'dir',
          path: dirPath,
        } satisfies DirWithPathInterface,
        customOperations,
      );
    },
    $dirDelete(dirName) {
      fs.rmSync(getPath(dirName), {
        recursive: true,
        force: true,
      });
    },
    $fileClear(fileName) {
      if (this.$exists(fileName)) {
        this.$fileWrite(fileName, '');
      }
    },
    $fileCreate(fileName, data) {
      type FileCreateResult = FileOperations extends OperationsType
        ? FileOperationsInterface & FileOperations
        : FileOperationsInterface;

      this.$fileWrite(fileName, data ?? '');

      const file: FileWithPathInterface = {
        type: 'file',
        data,
        path: getPath(fileName),
      };

      return {
        ...fileOperations(file),
        ...customOperations.file?.(file),
      } as FileCreateResult;
    },
    $fileDelete(fileName) {
      fs.rmSync(getPath(fileName));
    },
    $fileRead: (fileName) => readFile(getPath(fileName)),
    $fileWrite(fileName, data) {
      const content = data instanceof Function ? data() : data;
      fs.writeFileSync(getPath(fileName), content);
    },
  };

  return operations;
}

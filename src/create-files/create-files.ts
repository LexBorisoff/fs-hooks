import fs from 'node:fs';
import path from 'node:path';
import type { FileTreeInterface } from '../types/file-tree.types.js';
import type {
  OperationsRecord,
  OperationsType,
} from '../types/operation.types.js';
import { isDirectory } from '../utils/is-directory.js';
import { createDir } from '../utils/create-dir.js';
import { TREE_SYM } from '../operations/build-operations.js';

function logErrors(errors: string[]): void {
  errors.forEach((error) => {
    console.error(error);
  });
}

export function createFiles<
  Tree extends FileTreeInterface,
  FileOperations extends OperationsRecord = OperationsRecord,
  DirOperations extends OperationsRecord = OperationsRecord,
>(operations: OperationsType<Tree, FileOperations, DirOperations>): void {
  const rootPath = operations.$getPath();

  if (fs.existsSync(rootPath) && !isDirectory(rootPath)) {
    throw new Error('Root path already exists and is not a directory');
  }

  const errors: string[] = [];

  function addError(type: 'dir' | 'file', filePath: string): void {
    errors.push(
      `Cannot create ${type === 'file' ? 'file' : 'directory'} ${filePath}`,
    );
  }

  function traverse(
    parentPath: string,
    currentFileTree?: FileTreeInterface,
  ): void {
    Object.entries(currentFileTree ?? {}).forEach(([key, value]) => {
      const fullPath = path.resolve(parentPath, key);

      if (typeof value === 'string') {
        if (fs.existsSync(fullPath) && isDirectory(fullPath)) {
          addError('file', fullPath);
          return;
        }

        fs.writeFileSync(fullPath, value);
        return;
      }

      try {
        createDir(fullPath);

        if (Object.keys(value).length > 0) {
          traverse(fullPath, value);
        }
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error.message);
        } else {
          addError('dir', fullPath);
        }
      }
    });
  }

  try {
    if (!fs.existsSync(rootPath)) {
      createDir(rootPath);
    }

    const fileTree: FileTreeInterface = Object.getOwnPropertyDescriptor(
      operations,
      TREE_SYM,
    )?.value;

    traverse(rootPath, fileTree);
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
    } else {
      addError('dir', rootPath);
    }
  }

  if (errors.length > 0) {
    logErrors(errors);
  }
}

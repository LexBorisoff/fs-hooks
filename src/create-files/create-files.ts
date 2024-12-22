import fs from 'node:fs';
import path from 'node:path';

import { CreateFileErrorReason } from '@errors/create-file-error.enums.js';
import { CreateFileError } from '@errors/create-file.error.js';
import { getTreeDir } from '@operations/utils/get-tree-value.js';
import { createDir } from '@utils/create-dir.js';
import { isDirectory } from '@utils/is-directory.js';

import type { FileTreeInterface } from '@app-types/file-tree.types.js';
import type { DirOperationsType } from '@app-types/operation.types.js';

export function createFiles(
  operations: DirOperationsType<any>,
): CreateFileError[] {
  const errors: CreateFileError[] = [];
  const rootPath = operations.$getPath();

  function traverse(
    parentPath: string,
    currentFileTree: FileTreeInterface,
  ): void {
    Object.entries(currentFileTree).forEach(([key, value]) => {
      const fullPath = path.resolve(parentPath, key);

      try {
        if (typeof value === 'string') {
          if (fs.existsSync(fullPath) && isDirectory(fullPath)) {
            errors.push(
              new CreateFileError(
                'file',
                fullPath,
                CreateFileErrorReason.PathExistsAsDir,
              ),
            );
            return;
          }

          fs.writeFileSync(fullPath, value);
          return;
        }

        createDir(fullPath);

        if (Object.keys(value).length > 0) {
          traverse(fullPath, value);
        }
      } catch (error) {
        if (error instanceof CreateFileError) {
          errors.push(error);
        }
      }
    });
  }

  try {
    createDir(rootPath);

    const fileTree = getTreeDir(operations);
    traverse(rootPath, fileTree);
  } catch (error) {
    if (error instanceof CreateFileError) {
      errors.push(error);
    }
  }

  return errors;
}

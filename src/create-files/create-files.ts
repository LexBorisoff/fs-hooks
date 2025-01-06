import fs from 'node:fs';
import path from 'node:path';

import { CreateFileErrorReason } from '@errors/create-file-error.enums.js';
import { CreateFileError } from '@errors/create-file.error.js';
import { createDir } from '@utils/create-dir.js';

import type { FsHooks } from '../fs-hooks.js';
import type { TreeInterface } from '@app-types/tree.types.js';

export function createFiles(
  fsHooks: FsHooks<TreeInterface>,
): CreateFileError[] {
  const errors: CreateFileError[] = [];

  function traverse(parentPath: string, currentTree: TreeInterface): void {
    Object.entries(currentTree).forEach(([key, value]) => {
      const fullPath = path.resolve(parentPath, key);

      try {
        if (typeof value === 'string') {
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
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
    const { rootPath, tree } = fsHooks;

    createDir(rootPath);
    traverse(rootPath, tree);
  } catch (error) {
    if (error instanceof CreateFileError) {
      errors.push(error);
    } else {
      throw error;
    }
  }

  return errors;
}

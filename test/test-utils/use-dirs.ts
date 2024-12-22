import fs from 'node:fs';

import { getDirsInfo } from './get-dirs-info.js';

import type { FileTreeInterface } from '@app-types/file-tree.types.js';
import type {
  DirOperationsType,
  OperationsRecord,
} from '@app-types/operation.types.js';

type GetDescribePathFn = (...args: string[]) => string;
type UseDirsCb<
  ExtraFileOperations extends OperationsRecord | undefined,
  ExtraDirOperations extends OperationsRecord | undefined,
> = (
  dir: DirOperationsType<
    FileTreeInterface,
    ExtraFileOperations,
    ExtraDirOperations
  >,
  info: {
    pathDirs: string[];
    children: string[];
  },
) => void;

export type UseDirsFn<
  ExtraFileOperations extends OperationsRecord | undefined,
  ExtraDirOperations extends OperationsRecord | undefined,
> = (cb: UseDirsCb<ExtraFileOperations, ExtraDirOperations>) => void;

export const NEW_DIR_NAME = 'new-dir';

export function getUseDirs<
  ExtraFileOperations extends OperationsRecord | undefined,
  ExtraDirOperations extends OperationsRecord | undefined,
>(
  operations: DirOperationsType<
    FileTreeInterface,
    ExtraFileOperations,
    ExtraDirOperations
  >,
  getDescribePath: GetDescribePathFn,
): UseDirsFn<ExtraFileOperations, ExtraDirOperations> {
  return function useDirs(cb) {
    const dirs = getDirsInfo(operations);

    /**
     * Types of directories for testing
     * 1. from the file tree
     * 2. created with $dirCreate
     */
    dirs.forEach(({ dir, pathDirs, children }) => {
      const dirPath = getDescribePath(...pathDirs);
      fs.mkdirSync(dirPath, { recursive: true });

      cb(dir, { pathDirs, children });

      const createdDir = dir.$dirCreate(NEW_DIR_NAME) as DirOperationsType<
        FileTreeInterface,
        ExtraFileOperations,
        ExtraDirOperations
      >;
      cb(createdDir, {
        pathDirs: pathDirs.concat(NEW_DIR_NAME),
        children: [],
      });
    });
  };
}

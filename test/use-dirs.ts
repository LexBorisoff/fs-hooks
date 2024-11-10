import fs from 'node:fs';
import type { FileTreeInterface } from '../src/types/file-tree.types.js';
import type {
  DirOperationsType,
  OperationsRecord,
} from '../src/types/operation.types.js';
import { getDirsInfo } from './get-dirs-info.js';

type GetDescribePathFn = (...args: string[]) => string;
type UseDirsCb<
  ExtraFileOperations extends OperationsRecord,
  ExtraDirOperations extends OperationsRecord,
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
  ExtraFileOperations extends OperationsRecord = OperationsRecord,
  ExtraDirOperations extends OperationsRecord = OperationsRecord,
> = (cb: UseDirsCb<ExtraFileOperations, ExtraDirOperations>) => void;

export const NEW_DIR_NAME = 'new-dir';

export function getUseDirs<
  Tree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord,
  ExtraDirOperations extends OperationsRecord,
>(
  operations: DirOperationsType<Tree, ExtraFileOperations, ExtraDirOperations>,
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
      cb(dir.$dirCreate(NEW_DIR_NAME), {
        pathDirs: pathDirs.concat(NEW_DIR_NAME),
        children: [],
      });
    });
  };
}
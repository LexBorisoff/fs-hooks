import fs from 'node:fs';
import type { FileTreeInterface } from '../src/types/file-tree.types.js';
import type {
  DirOperationsType,
  OperationsRecord,
  OperationsType,
} from '../src/types/operation.types.js';
import { isDirOperations } from '../src/operations/is-dir-operations.js';
import type { Tree } from './tree.js';

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
  meta: {
    pathDirs: string[];
    children: string[];
  },
) => void;

export type UseDirsFn<
  ExtraFileOperations extends OperationsRecord = OperationsRecord,
  ExtraDirOperations extends OperationsRecord = OperationsRecord,
> = (cb: UseDirsCb<ExtraFileOperations, ExtraDirOperations>) => void;

export function getUseDirs<
  ExtraFileOperations extends OperationsRecord,
  ExtraDirOperations extends OperationsRecord,
>(
  operations: OperationsType<Tree, ExtraFileOperations, ExtraDirOperations>,
  getDescribePath: GetDescribePathFn,
): UseDirsFn<ExtraFileOperations, ExtraDirOperations> {
  return function useDirs(
    cb: UseDirsCb<ExtraFileOperations, ExtraDirOperations>,
  ): void {
    type DirOperations<T extends FileTreeInterface> = DirOperationsType<
      T,
      ExtraFileOperations,
      ExtraDirOperations
    >;

    interface DirType<T extends FileTreeInterface> {
      dir: DirOperations<T>;
      pathDirs: string[];
      children: string[];
    }

    function getChildren<T extends FileTreeInterface>(
      dir: DirOperations<T>,
    ): string[] {
      return Object.entries(dir)
        .filter(([, value]) => !(value instanceof Function))
        .map(([key]) => key);
    }

    const operationsDir: DirType<Tree> = {
      dir: operations,
      pathDirs: [],
      children: getChildren(operations),
    };

    const dirs: DirType<FileTreeInterface>[] = [operationsDir];

    function traverse<T extends FileTreeInterface>(node: DirType<T>): void {
      Object.entries(node).forEach(([key, { dir, pathDirs }]) => {
        if (typeof dir === 'object' && isDirOperations(dir)) {
          const result: DirType<T> = {
            dir,
            pathDirs: pathDirs.concat(key),
            children: getChildren(dir),
          };

          dirs.push(result);
          traverse(result);
        }
      });
    }

    traverse(operationsDir);

    const dirName = 'new-dir';

    /**
     * Types of directories for testing
     * 1. from the file tree
     * 2. created with $dirCreate
     */
    dirs.forEach(({ dir, pathDirs, children }) => {
      const dirPath = getDescribePath(...pathDirs);
      fs.mkdirSync(dirPath, { recursive: true });

      cb(dir, { pathDirs, children });
      cb(dir.$dirCreate(dirName), {
        pathDirs: pathDirs.concat(dirName),
        children: [],
      });
    });
  };
}

import fs from 'node:fs';
import type { FileTreeInterface } from '../src/types/file-tree.types.js';
import type {
  DirOperationsType,
  OperationsRecord,
  OperationsType,
} from '../src/types/operation.types.js';
import { OperationsTypeEnum } from '../src/operations/operations-type.enum.js';
import { OPERATIONS_TYPE_SYM } from '../src/operations/operation.constants.js';
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
    type DirOperations = DirOperationsType<
      FileTreeInterface,
      ExtraFileOperations,
      ExtraDirOperations
    >;

    interface DirType {
      dir: DirOperations;
      pathDirs: string[];
      children: string[];
    }

    function getChildren(dir: DirOperations): string[] {
      return Object.entries(dir)
        .filter(([, value]) => !(value instanceof Function))
        .map(([key]) => key);
    }

    const dirs: DirType[] = [
      {
        dir: operations,
        pathDirs: [],
        children: getChildren(operations),
      },
    ];

    function traverse(node: DirOperations, parentDirs: string[]): void {
      Object.entries(node).forEach(([key, value]) => {
        if (typeof value === 'object') {
          const operationsObjectType: OperationsTypeEnum | undefined =
            Object.getOwnPropertyDescriptor(value, OPERATIONS_TYPE_SYM)?.value;

          if (operationsObjectType === OperationsTypeEnum.Dir) {
            const currentDirs = parentDirs.concat(key);
            dirs.push({
              dir: value,
              pathDirs: currentDirs,
              children: getChildren(value),
            });
            traverse(value, currentDirs);
          }
        }
      });
    }

    traverse(operations, []);

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

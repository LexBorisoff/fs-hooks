import { isDirOperations } from '../src/operations/utils/is-operations.js';
import type { FileTreeInterface } from '../src/types/file-tree.types.js';
import type {
  DirOperationsType,
  OperationsRecord,
  OperationType,
} from '../src/types/operation.types.js';

interface DirInfo<
  T extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord,
  ExtraDirOperations extends OperationsRecord,
> {
  dir: DirOperationsType<T, ExtraFileOperations, ExtraDirOperations>;
  pathDirs: string[];
  children: string[];
}

// TODO: test
export function getDirsInfo<
  Tree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord,
  ExtraDirOperations extends OperationsRecord,
>(
  operations: DirOperationsType<Tree, ExtraFileOperations, ExtraDirOperations>,
): DirInfo<FileTreeInterface, ExtraFileOperations, ExtraDirOperations>[] {
  type DirNode<T extends FileTreeInterface> = OperationType<
    T,
    ExtraFileOperations,
    ExtraDirOperations
  >;
  type DirOperations<T extends FileTreeInterface> = DirOperationsType<
    T,
    ExtraFileOperations,
    ExtraDirOperations
  >;

  function getChildren<T extends FileTreeInterface>(
    dir: DirOperations<T>,
  ): string[] {
    return Object.entries(dir)
      .filter(([, value]) => !(value instanceof Function))
      .map(([key]) => key);
  }

  const dirs: DirInfo<
    FileTreeInterface,
    ExtraFileOperations,
    ExtraDirOperations
  >[] = [];

  function traverse<T extends FileTreeInterface>(
    dir: DirOperations<T>,
    pathDirs: string[],
  ): void {
    dirs.push({ dir, pathDirs, children: getChildren(dir) });

    Object.entries(dir).forEach(([key, node]: [string, DirNode<T>]) => {
      if (typeof node === 'object' && isDirOperations(node)) {
        traverse(node, pathDirs.concat(key));
      }
    });
  }

  traverse(operations, []);

  return dirs;
}

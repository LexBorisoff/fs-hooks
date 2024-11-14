import { isDirOperations } from '@app/operations/utils/is-operations.js';
import type {
  FileTreeInterface,
  DirOperationsType,
  OperationsRecord,
} from '@app-types';

interface DirInfo<
  T extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord | undefined,
  ExtraDirOperations extends OperationsRecord | undefined,
> {
  dir: DirOperationsType<T, ExtraFileOperations, ExtraDirOperations>;
  pathDirs: string[];
  children: string[];
}

export function getDirsInfo<
  ExtraFileOperations extends OperationsRecord | undefined,
  ExtraDirOperations extends OperationsRecord | undefined,
>(
  operations: DirOperationsType<any, ExtraFileOperations, ExtraDirOperations>,
): DirInfo<FileTreeInterface, ExtraFileOperations, ExtraDirOperations>[] {
  type DirOperations<T extends FileTreeInterface> = DirOperationsType<
    T,
    ExtraFileOperations,
    ExtraDirOperations
  >;

  function getChildren(dir: DirOperations<any>): string[] {
    return Object.entries(dir)
      .filter(([, value]) => !(value instanceof Function))
      .map(([key]) => key);
  }

  const dirs: DirInfo<
    FileTreeInterface,
    ExtraFileOperations,
    ExtraDirOperations
  >[] = [];

  function traverse(dir: DirOperations<any>, pathDirs: string[]): void {
    dirs.push({
      dir,
      pathDirs,
      children: getChildren(dir),
    });

    Object.entries(dir).forEach(([key, node]) => {
      if (
        typeof node === 'object' &&
        isDirOperations<
          FileTreeInterface,
          ExtraFileOperations,
          ExtraDirOperations
        >(node)
      ) {
        traverse(node, pathDirs.concat(key));
      }
    });
  }

  traverse(operations, []);

  return dirs;
}

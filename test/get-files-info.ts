import { getTreeFile } from '../src/operations/utils/get-tree-value.js';
import {
  isDirOperations,
  isFileOperations,
} from '../src/operations/utils/is-operations.js';
import type {
  FileTreeInterface,
  FileType,
} from '../src/types/file-tree.types.js';
import type {
  OperationType,
  DirOperationsType,
  FileOperationsType,
  OperationsRecord,
} from '../src/types/operation.types.js';

export interface FileInfo<
  ExtraFileOperations extends OperationsRecord = OperationsRecord,
  ExtraDirOperations extends OperationsRecord = OperationsRecord,
> {
  file: FileOperationsType<ExtraFileOperations>;
  fileName: string;
  treeFile: FileType;
  dir: DirOperationsType<
    FileTreeInterface,
    ExtraFileOperations,
    ExtraDirOperations
  >;
  pathDirs: string[];
}

export function getFilesInfo<
  Tree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord,
  ExtraDirOperations extends OperationsRecord,
>(
  operations: DirOperationsType<Tree, ExtraFileOperations, ExtraDirOperations>,
): FileInfo<ExtraFileOperations, ExtraDirOperations>[] {
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

  const files: FileInfo<ExtraFileOperations, ExtraDirOperations>[] = [];

  function traverse<T extends FileTreeInterface>(
    dir: DirOperations<T>,
    pathDirs: string[],
  ): void {
    Object.entries(dir).forEach(([key, node]: [string, DirNode<T>]) => {
      if (typeof node === 'object') {
        if (isFileOperations(node)) {
          const treeFile = getTreeFile(node);
          files.push({
            file: node,
            fileName: key,
            treeFile,
            dir,
            pathDirs,
          });
          return;
        }

        if (isDirOperations(node)) {
          traverse(node, pathDirs.concat(key));
        }
      }
    });
  }

  traverse(operations, []);

  return files;
}

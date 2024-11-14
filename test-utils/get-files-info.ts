import { getTreeFile } from '@app/operations/utils/get-tree-value.js';
import {
  isDirOperations,
  isFileOperations,
} from '@app/operations/utils/is-operations.js';
import type {
  FileTreeInterface,
  FileType,
  DirOperationsType,
  FileOperationsType,
  OperationsRecord,
} from '@app-types';

export interface FileInfo<
  ExtraFileOperations extends OperationsRecord | undefined,
  ExtraDirOperations extends OperationsRecord | undefined,
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
  ExtraFileOperations extends OperationsRecord | undefined,
  ExtraDirOperations extends OperationsRecord | undefined,
>(
  operations: DirOperationsType<any, ExtraFileOperations, ExtraDirOperations>,
): FileInfo<ExtraFileOperations, ExtraDirOperations>[] {
  type DirOperations<T extends FileTreeInterface> = DirOperationsType<
    T,
    ExtraFileOperations,
    ExtraDirOperations
  >;

  const files: FileInfo<ExtraFileOperations, ExtraDirOperations>[] = [];

  function traverse(dir: DirOperations<any>, pathDirs: string[]): void {
    Object.entries(dir).forEach(([key, node]) => {
      if (typeof node === 'object') {
        if (isFileOperations<ExtraFileOperations>(node)) {
          files.push({
            file: node,
            fileName: key,
            treeFile: getTreeFile(node),
            dir,
            pathDirs,
          });
          return;
        }

        if (
          isDirOperations<
            FileTreeInterface,
            ExtraFileOperations,
            ExtraDirOperations
          >(node)
        ) {
          traverse(node, pathDirs.concat(key));
        }
      }
    });
  }

  traverse(operations, []);

  return files;
}

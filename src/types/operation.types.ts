import type {
  DirInterface,
  FileInterface,
  FileTree,
} from './file-tree.types.js';

export interface FileOperations {
  read: () => string | null;
  write: (contents: string | (() => string)) => void;
  clear: () => void;
  exists: () => boolean;
}

export interface DirOperations {
  createDir(dirName: string): DirOperations;
  deleteDir(dirName: string): void;
  createFile(fileName: string, data?: string | (() => string)): FileOperations;
  writeFile(fileName: string, data?: string | (() => string)): void;
  readFile(fileName: string): string | null;
  clearFile(fileName: string): void;
  deleteFile(fileName: string): boolean;
  exists(filePath: string): boolean;
}

export type OperationTree<T extends FileTree<true>> = {
  [K in keyof T]: T[K] extends DirInterface<true>
    ? T[K]['children'] extends FileTree
      ? DirOperations & OperationTree<T[K]['children']>
      : DirOperations
    : T[K] extends FileInterface
      ? FileOperations
      : never;
};

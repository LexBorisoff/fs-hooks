import type { FileTreeInterface, AppDir } from '../../types/file-tree.types.js';

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

export type OperationTreeInterface<T extends FileTreeInterface<false>> =
  DirOperations & {
    [K in keyof T]: T[K] extends AppDir
      ? T[K]['children'] extends FileTreeInterface
        ? DirOperations & OperationTreeInterface<T[K]['children']>
        : DirOperations
      : FileOperations;
  };

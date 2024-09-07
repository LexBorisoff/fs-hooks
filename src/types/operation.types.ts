import type {
  DirInterface,
  FileInterface,
  FileTree,
  FileWithPath,
} from './file-tree.types.js';

export type Fn = (...args: any[]) => any;
export type Operations = Record<string, Fn>;
export type GetFileOperationsFn<FOperations extends Operations> = <
  File extends FileInterface,
>(
  file: FileWithPath<File>,
) => FOperations;

export interface FileOperationsInterface {
  read: () => string | null;
  write: (contents: string | (() => string)) => void;
  clear: () => void;
  exists: () => boolean;
}

export interface DirOperationsInterface<
  FileExtra extends Operations,
  DirExtra extends Operations,
> {
  createDir(dirName: string): DirOperationsInterface<FileExtra, DirExtra>;
  deleteDir(dirName: string): void;
  createFile(
    fileName: string,
    data?: string | (() => string),
  ): FileOperationsInterface & FileExtra;
  writeFile(fileName: string, data?: string | (() => string)): void;
  readFile(fileName: string): string | null;
  clearFile(fileName: string): void;
  deleteFile(fileName: string): boolean;
  exists(filePath: string): boolean;
}

export type FileOperations<FileExtra extends Operations> =
  FileOperationsInterface & FileExtra;

export type DirOperations<
  FileExtra extends Operations,
  DirExtra extends Operations,
> = DirOperationsInterface<FileExtra, DirExtra> & DirExtra;

export type OperationTree<
  T extends FileTree<true>,
  FileExtra extends Operations,
  DirExtra extends Operations,
> = {
  [K in keyof T]: T[K] extends DirInterface<true>
    ? T[K]['children'] extends FileTree<true>
      ? DirOperations<FileExtra, DirExtra> &
          OperationTree<T[K]['children'], FileExtra, DirExtra>
      : DirOperations<FileExtra, DirExtra>
    : T[K] extends FileInterface
      ? FileOperations<FileExtra>
      : never;
};

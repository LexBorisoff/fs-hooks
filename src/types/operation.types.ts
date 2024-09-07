import type {
  DirInterface,
  DirWithPathType,
  FileInterface,
  FileTreeInterface,
  FileWithPathType,
  PathInterface,
} from './file-tree.types.js';

export type Fn = (...args: any[]) => any;
export type OperationsType<K extends string> = Record<K, Fn>;
export type GetFileOperationsFn<
  K extends string,
  O extends OperationsType<K>,
> = <F extends FileInterface>(file: FileWithPathType<F>) => O;

export type GetDirOperationsFn<
  K extends string,
  O extends OperationsType<K>,
> = <D extends DirInterface>(dir: DirWithPathType<D>) => O;

export type PathOperationsType = {
  [K in keyof PathInterface]: () => string;
};

export interface FileOperationsInterface extends PathOperationsType {
  [operation: string]: Fn;
  read: () => string | null;
  write: (data: string | (() => string)) => void;
  clear: () => void;
  exists: () => boolean;
}

export type FileNamesType<Children extends FileTreeInterface | undefined> =
  Children extends FileTreeInterface
    ? {
        [key in keyof Children]: Children[key] extends FileInterface
          ? key
          : never;
      }
    : never;

export type DirNamesType<Children extends FileTreeInterface | undefined> =
  Children extends FileTreeInterface
    ? {
        [key in keyof Children]: Children[key] extends DirInterface
          ? key
          : never;
      }
    : never;

export interface DirOperationsInterface<
  Children extends FileTreeInterface | undefined,
  F = FileNamesType<Children>,
  D = DirNamesType<Children>,
> extends PathOperationsType {
  [operation: string]: Fn;
  createDir(dirName: string): DirOperationsInterface<undefined>;
  deleteDir(dirName: D[keyof D] | (string & {})): boolean;
  createFile(
    fileName: string,
    data?: string | (() => string),
  ): FileOperationsInterface;
  writeFile(
    fileName: F[keyof F] | (string & {}),
    data?: string | (() => string),
  ): void;
  readFile(fileName: F[keyof F] | (string & {})): string | null;
  clearFile(fileName: F[keyof F] | (string & {})): void;
  deleteFile(fileName: F[keyof F] | (string & {})): boolean;
  exists(filePath: F[keyof F] | D[keyof D] | (string & {})): boolean;
}

export type OperationTreeType<T extends FileTreeInterface> = {
  [key in keyof T]: T[key] extends FileInterface
    ? PathInterface & FileOperationsInterface
    : T[key] extends DirInterface
      ? T[key]['children'] extends FileTreeInterface
        ? PathInterface &
            DirOperationsInterface<T[key]['children']> &
            OperationTreeType<T[key]['children']>
        : PathInterface & DirOperationsInterface<T[key]['children']>
      : never;
};

export type CreateOperationTreeType<T extends FileTreeInterface> =
  DirOperationsInterface<T> & OperationTreeType<T>;

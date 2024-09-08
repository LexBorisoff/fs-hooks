import type {
  DirInterface,
  DirWithPathType,
  FileInterface,
  FileTreeInterface,
  FileWithPathType,
} from './file-tree.types.js';

export type Fn = (...args: any[]) => any;
export type OperationsType = Record<string, Fn>;

export type GetFileOperationsFn<O extends OperationsType> = <
  F extends FileInterface,
>(
  file: FileWithPathType<F>,
) => O;

export type GetDirOperationsFn<O extends OperationsType> = <
  D extends DirInterface,
>(
  dir: DirWithPathType<D>,
) => O;

export interface FileOperationsInterface {
  getPath: () => string;
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
  FileOperations extends OperationsType | undefined,
  F = FileNamesType<Children>,
  D = DirNamesType<Children>,
> {
  getPath: () => string;
  createDir(dirName: string): DirOperationsInterface<undefined, FileOperations>;
  deleteDir(dirName: D[keyof D] | (string & {})): void;
  createFile(
    fileName: string,
    data?: string | (() => string),
  ): FileOperations extends OperationsType
    ? FileOperationsInterface & FileOperations
    : FileOperationsInterface;
  writeFile(
    fileName: F[keyof F] | (string & {}),
    data?: string | (() => string),
  ): void;
  readFile(fileName: F[keyof F] | (string & {})): string | null;
  clearFile(fileName: F[keyof F] | (string & {})): void;
  deleteFile(fileName: F[keyof F] | (string & {})): void;
  exists(filePath: F[keyof F] | D[keyof D] | (string & {})): boolean;
}

export type DirOperationsType<
  Children extends FileTreeInterface | undefined,
  FileOperations extends OperationsType | undefined,
  DirOperations extends OperationsType | undefined,
> = DirOperations extends OperationsType
  ? DirOperationsInterface<Children, FileOperations> & DirOperations
  : DirOperationsInterface<Children, FileOperations>;

export type OperationTreeType<
  T extends FileTreeInterface,
  FileOperations extends OperationsType | undefined,
  DirOperations extends OperationsType | undefined,
> = {
  [key in keyof T]: T[key] extends FileInterface
    ? FileOperations extends OperationsType
      ? FileOperationsInterface & FileOperations
      : FileOperationsInterface
    : T[key] extends DirInterface
      ? T[key]['children'] extends FileTreeInterface
        ? DirOperationsType<T[key]['children'], FileOperations, DirOperations> &
            OperationTreeType<T[key]['children'], FileOperations, DirOperations>
        : DirOperationsType<T[key]['children'], FileOperations, DirOperations>
      : never;
};

export type CreateOperationTreeType<
  T extends FileTreeInterface,
  FileOperations extends OperationsType | undefined,
  DirOperations extends OperationsType | undefined,
> = DirOperationsType<T, FileOperations, DirOperations> &
  OperationTreeType<T, FileOperations, DirOperations>;

export interface CustomOperationsInterface<
  FileOperations extends OperationsType | undefined,
  DirOperations extends OperationsType | undefined,
> {
  file?: FileOperations extends OperationsType
    ? GetFileOperationsFn<FileOperations>
    : undefined;
  dir?: DirOperations extends OperationsType
    ? GetDirOperationsFn<DirOperations>
    : undefined;
}

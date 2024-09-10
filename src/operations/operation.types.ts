import type {
  DirInterface,
  DirWithPathType,
  FileInterface,
  FileTreeInterface,
  FileWithPathType,
} from '../file-tree/file-tree.types.js';

export type Fn = (...args: any[]) => any;
export type OperationsType = Record<string, Fn>;

export type GetFileOperationsFn<CustomFileOperations extends OperationsType> = <
  F extends FileInterface,
>(
  file: FileWithPathType<F>,
) => CustomFileOperations;

export type GetDirOperationsFn<CustomDirOperations extends OperationsType> = <
  D extends DirInterface,
>(
  dir: DirWithPathType<D>,
) => CustomDirOperations;

export interface CustomOperationsInterface<
  CustomFileOperations extends OperationsType | undefined,
  CustomDirOperations extends OperationsType | undefined,
> {
  file?: CustomFileOperations extends OperationsType
    ? GetFileOperationsFn<CustomFileOperations>
    : undefined;
  dir?: CustomDirOperations extends OperationsType
    ? GetDirOperationsFn<CustomDirOperations>
    : undefined;
}

export interface FileOperationsInterface {
  $getPath(): string;
  $exists(): boolean;
  $clear(): void;
  $read(): string | null;
  $write(data: string | (() => string)): void;
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
  CustomFileOperations extends OperationsType | undefined,
  F = FileNamesType<Children>,
  D = DirNamesType<Children>,
> {
  $getPath(): string;
  $exists(fileName: F[keyof F] | D[keyof D] | (string & {})): boolean;
  $dirCreate(
    dirName: string,
  ): DirOperationsInterface<undefined, CustomFileOperations>;
  /**
   * Delete a directory using `recursive` and `force` options
   */
  $dirDelete(dirName: D[keyof D] | (string & {})): void;
  $fileClear(fileName: F[keyof F] | (string & {})): void;
  $fileCreate(
    fileName: string,
    data?: string | (() => string),
  ): CustomFileOperations extends OperationsType
    ? FileOperationsInterface & CustomFileOperations
    : FileOperationsInterface;
  $fileWrite(
    fileName: F[keyof F] | (string & {}),
    data: string | (() => string),
  ): void;
  $fileRead(fileName: F[keyof F] | (string & {})): string | null;
  $fileDelete(fileName: F[keyof F] | (string & {})): void;
}

export type DirOperationsType<
  Children extends FileTreeInterface | undefined,
  CustomFileOperations extends OperationsType | undefined,
  CustomDirOperations extends OperationsType | undefined,
> = CustomDirOperations extends OperationsType
  ? DirOperationsInterface<Children, CustomFileOperations> & CustomDirOperations
  : DirOperationsInterface<Children, CustomFileOperations>;

export type OperationTreeType<
  T extends FileTreeInterface,
  CustomFileOperations extends OperationsType | undefined,
  CustomDirOperations extends OperationsType | undefined,
> = {
  [key in keyof T]: T[key] extends FileInterface
    ? CustomFileOperations extends OperationsType
      ? FileOperationsInterface & CustomFileOperations
      : FileOperationsInterface
    : T[key] extends DirInterface
      ? T[key]['children'] extends FileTreeInterface
        ? DirOperationsType<
            T[key]['children'],
            CustomFileOperations,
            CustomDirOperations
          > &
            OperationTreeType<
              T[key]['children'],
              CustomFileOperations,
              CustomDirOperations
            >
        : DirOperationsType<
            T[key]['children'],
            CustomFileOperations,
            CustomDirOperations
          >
      : never;
};

export type BuildOperationTreeType<
  T extends FileTreeInterface,
  CustomFileOperations extends OperationsType | undefined = undefined,
  CustomDirOperations extends OperationsType | undefined = undefined,
> = DirOperationsType<T, CustomFileOperations, CustomDirOperations> &
  OperationTreeType<T, CustomFileOperations, CustomDirOperations>;

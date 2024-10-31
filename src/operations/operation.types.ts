import type {
  DirObjectInterface,
  FileObjectInterface,
  FileTreeInterface,
  TreeDirInterface,
  TreeFileType,
} from '../file-tree/file-tree.types.js';

export type Fn = (...args: any[]) => any;
export type OperationsType = Record<string, Fn>;

export type GetFileOperationsFn<
  CustomFileOperations extends OperationsType = OperationsType,
> = (file: FileObjectInterface) => CustomFileOperations;

export type GetDirOperationsFn<
  CustomDirOperations extends OperationsType = OperationsType,
> = <ChildTree extends FileTreeInterface>(
  dir: DirObjectInterface<ChildTree>,
) => CustomDirOperations;

export interface CustomOperationsInterface<
  CustomFileOperations extends OperationsType = OperationsType,
  CustomDirOperations extends OperationsType = OperationsType,
> {
  fileOperations?: GetFileOperationsFn<CustomFileOperations>;
  dirOperations?: GetDirOperationsFn<CustomDirOperations>;
}

export interface FileOperationsInterface {
  $getPath(): string;
  $read(): string | null;
  $write(data: string | (() => string)): void;
  $clear(): void;
}

export type FileNamesType<ChildTree extends FileTreeInterface> = {
  [key in keyof ChildTree]: key extends string
    ? ChildTree[key] extends TreeFileType
      ? key
      : never
    : never;
};

export type DirNamesType<ChildTree extends FileTreeInterface> = {
  [key in keyof ChildTree]: key extends string
    ? ChildTree[key] extends TreeDirInterface
      ? key
      : never
    : never;
};

export interface DirOperationsInterface<
  ChildTree extends FileTreeInterface,
  CustomFileOperations extends OperationsType = OperationsType,
  CustomDirOperations extends OperationsType = OperationsType,
  F = FileNamesType<ChildTree>,
  D = DirNamesType<ChildTree>,
> {
  $getPath(): string;
  $exists(fileName: F[keyof F] | D[keyof D] | (string & {})): boolean;
  $dirCreate(
    dirName: string,
  ): DirOperationsInterface<
    FileTreeInterface,
    CustomFileOperations,
    CustomDirOperations
  > &
    CustomDirOperations;

  /**
   * Delete a directory using `recursive` and `force` options
   */
  $dirDelete(dirName: D[keyof D] | (string & {})): void;
  $fileClear(fileName: F[keyof F] | (string & {})): void;
  $fileCreate(
    fileName: string,
    data?: string,
  ): FileOperationsInterface & CustomFileOperations;
  $fileWrite(fileName: F[keyof F] | (string & {}), data: string): void;
  $fileRead(fileName: F[keyof F] | (string & {})): string | null;
  $fileDelete(fileName: F[keyof F] | (string & {})): void;
}

export type DirOperationsType<
  ChildTree extends FileTreeInterface,
  CustomFileOperations extends OperationsType,
  CustomDirOperations extends OperationsType,
> = DirOperationsInterface<
  ChildTree,
  CustomFileOperations,
  CustomDirOperations
> &
  CustomDirOperations;

type OperationTreeType<
  Tree extends FileTreeInterface,
  CustomFileOperations extends OperationsType,
  CustomDirOperations extends OperationsType,
> = {
  [key in keyof Tree]: Tree[key] extends TreeFileType
    ? FileOperationsInterface & CustomFileOperations
    : Tree[key] extends TreeDirInterface
      ? DirOperationsType<
          Tree[key],
          CustomFileOperations,
          CustomDirOperations
        > &
          OperationTreeType<
            Tree[key],
            CustomFileOperations,
            CustomDirOperations
          >
      : never;
};

export type RootOperationTreeType<
  Tree extends FileTreeInterface,
  CustomFileOperations extends OperationsType = OperationsType,
  CustomDirOperations extends OperationsType = OperationsType,
> = DirOperationsType<Tree, CustomFileOperations, CustomDirOperations> &
  OperationTreeType<Tree, CustomFileOperations, CustomDirOperations>;

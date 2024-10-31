import type {
  DirObjectInterface,
  FileObjectInterface,
  FileTreeInterface,
  TreeDirInterface,
  TreeFileType,
} from './file-tree.types.js';

export type Fn = (...args: any[]) => any;
export type OperationsRecord = Record<string, Fn>;

export type FileOperationsFn<
  ExtraFileOperations extends OperationsRecord = OperationsRecord,
> = (file: FileObjectInterface) => ExtraFileOperations;

export type DirOperationsFn<
  ExtraDirOperations extends OperationsRecord = OperationsRecord,
> = <ChildTree extends FileTreeInterface>(
  dir: DirObjectInterface<ChildTree>,
) => ExtraDirOperations;

export interface ExtensionsInterface<
  ExtraFileOperations extends OperationsRecord = OperationsRecord,
  ExtraDirOperations extends OperationsRecord = OperationsRecord,
> {
  fileOperations?: FileOperationsFn<ExtraFileOperations>;
  dirOperations?: DirOperationsFn<ExtraDirOperations>;
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
  ExtraFileOperations extends OperationsRecord = OperationsRecord,
  ExtraDirOperations extends OperationsRecord = OperationsRecord,
  F = FileNamesType<ChildTree>,
  D = DirNamesType<ChildTree>,
> {
  $getPath(): string;
  $exists(fileName: F[keyof F] | D[keyof D] | (string & {})): boolean;
  $dirCreate(
    dirName: string,
  ): DirOperationsInterface<
    FileTreeInterface,
    ExtraFileOperations,
    ExtraDirOperations
  > &
    ExtraDirOperations;

  /**
   * Delete a directory using `recursive` and `force` options
   */
  $dirDelete(dirName: D[keyof D] | (string & {})): void;
  $fileClear(fileName: F[keyof F] | (string & {})): void;
  $fileCreate(
    fileName: string,
    data?: string,
  ): FileOperationsInterface & ExtraFileOperations;
  $fileWrite(fileName: F[keyof F] | (string & {}), data: string): void;
  $fileRead(fileName: F[keyof F] | (string & {})): string | null;
  $fileDelete(fileName: F[keyof F] | (string & {})): void;
}

export type DirOperationsType<
  ChildTree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord,
  ExtraDirOperations extends OperationsRecord,
> = DirOperationsInterface<ChildTree, ExtraFileOperations, ExtraDirOperations> &
  ExtraDirOperations;

type OperationTreeType<
  Tree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord,
  ExtraDirOperations extends OperationsRecord,
> = {
  [key in keyof Tree]: Tree[key] extends TreeFileType
    ? FileOperationsInterface & ExtraFileOperations
    : Tree[key] extends TreeDirInterface
      ? DirOperationsType<Tree[key], ExtraFileOperations, ExtraDirOperations> &
          OperationTreeType<Tree[key], ExtraFileOperations, ExtraDirOperations>
      : never;
};

export type FileTreeOperationsType<
  Tree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord = OperationsRecord,
  ExtraDirOperations extends OperationsRecord = OperationsRecord,
> = DirOperationsType<Tree, ExtraFileOperations, ExtraDirOperations> &
  OperationTreeType<Tree, ExtraFileOperations, ExtraDirOperations>;

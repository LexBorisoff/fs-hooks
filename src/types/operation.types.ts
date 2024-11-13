import type {
  DirObjectInterface,
  FileObjectInterface,
  FileTreeInterface,
  FileType,
} from './file-tree.types.js';

export type OperationsFn = (...args: any[]) => any;
export type OperationsRecord = Record<string, OperationsFn>;

export type FileOperationsFn<
  ExtraFileOperations extends OperationsRecord | undefined,
> = (file: FileObjectInterface) => ExtraFileOperations;

export type DirOperationsFn<
  ExtraDirOperations extends OperationsRecord | undefined,
> = <Tree extends FileTreeInterface>(
  dir: DirObjectInterface<Tree>,
) => ExtraDirOperations;

export interface ExtraOperationsInterface<
  ExtraFileOperations extends OperationsRecord | undefined,
  ExtraDirOperations extends OperationsRecord | undefined,
> {
  file?: FileOperationsFn<ExtraFileOperations>;
  dir?: DirOperationsFn<ExtraDirOperations>;
}

export interface FileOperationsInterface {
  $getPath(): string;
  $read(): string | null;
  $write(data: string | (() => string)): void;
  $clear(): void;
}

export type FileOperationsType<
  ExtraFileOperations extends OperationsRecord | undefined = undefined,
> = ExtraFileOperations extends OperationsRecord
  ? FileOperationsInterface & ExtraFileOperations
  : FileOperationsInterface;

export type FileNamesType<Tree extends FileTreeInterface> = {
  [key in keyof Tree]: key extends string
    ? Tree[key] extends FileType
      ? key
      : never
    : never;
};

export type DirNamesType<Tree extends FileTreeInterface> = {
  [key in keyof Tree]: key extends string
    ? Tree[key] extends FileTreeInterface
      ? key
      : never
    : never;
};

export interface DirOperationsInterface<
  Tree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord | undefined = undefined,
  ExtraDirOperations extends OperationsRecord | undefined = undefined,
  F = FileNamesType<Tree>,
  D = DirNamesType<Tree>,
> {
  $getPath(): string;
  $exists(fileName: F[keyof F] | D[keyof D] | (string & {})): boolean;
  $dirCreate(
    dirName: string,
  ): DirOperationsType<
    FileTreeInterface,
    ExtraFileOperations,
    ExtraDirOperations
  >;
  /**
   * Delete a directory using `recursive` and `force` options
   */
  $dirDelete(dirName: D[keyof D] | (string & {})): void;
  $fileClear(fileName: F[keyof F] | (string & {})): void;
  $fileCreate(
    fileName: string,
    data?: string,
  ): FileOperationsType<ExtraFileOperations>;
  $fileWrite(fileName: F[keyof F] | (string & {}), data: string): void;
  $fileRead(fileName: F[keyof F] | (string & {})): string | null;
  $fileDelete(fileName: F[keyof F] | (string & {})): void;
}

export type DirOperationsType<
  Tree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord | undefined = undefined,
  ExtraDirOperations extends OperationsRecord | undefined = undefined,
> = ExtraDirOperations extends OperationsRecord
  ? DirOperationsInterface<Tree, ExtraFileOperations, ExtraDirOperations> &
      OperationTreeType<Tree, ExtraFileOperations, ExtraDirOperations> &
      ExtraDirOperations
  : DirOperationsInterface<Tree, ExtraFileOperations, ExtraDirOperations> &
      OperationTreeType<Tree, ExtraFileOperations, ExtraDirOperations>;

export type OperationTreeType<
  Tree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord | undefined = undefined,
  ExtraDirOperations extends OperationsRecord | undefined = undefined,
> = {
  [key in keyof Tree]: Tree[key] extends FileType
    ? FileOperationsType<ExtraFileOperations>
    : Tree[key] extends FileTreeInterface
      ? DirOperationsType<Tree[key], ExtraFileOperations, ExtraDirOperations>
      : never;
};

export type OperationNodeType<
  Tree extends FileTreeInterface = FileTreeInterface,
  ExtraFileOperations extends OperationsRecord | undefined = undefined,
  ExtraDirOperations extends OperationsRecord | undefined = undefined,
> =
  | OperationsFn
  | FileOperationsType<ExtraFileOperations>
  | DirOperationsType<Tree, ExtraFileOperations, ExtraDirOperations>;

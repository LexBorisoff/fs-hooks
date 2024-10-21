import type { FileTreeInterface } from './file-tree/file-tree.types.js';
import type {
  FileTreeOperationsType,
  OperationsType,
} from './operations/operation.types.js';

export interface TreeResultInterface<
  T extends FileTreeInterface,
  CustomFileOperations extends OperationsType | undefined = undefined,
  CustomDirOperations extends OperationsType | undefined = undefined,
> {
  /**
   * Object with methods to perform file operations
   * on the provided file `tree` at the specified `root` path
   */
  files: FileTreeOperationsType<T, CustomFileOperations, CustomDirOperations>;
  /**
   * Creates files and directories in the file system
   * at the path provided in the `root`.
   * Skips over existing files and directories.
   */
  create: () => void;
}

export type TreeFn<
  CustomFileOperations extends OperationsType | undefined = undefined,
  CustomDirOperations extends OperationsType | undefined = undefined,
> = <T extends FileTreeInterface>(
  tree?: T,
) => TreeResultInterface<T, CustomFileOperations, CustomDirOperations>;

export interface RootResultInterface<
  CustomFileOperations extends OperationsType | undefined = undefined,
  CustomDirOperations extends OperationsType | undefined = undefined,
> {
  tree: TreeFn<CustomFileOperations, CustomDirOperations>;
}

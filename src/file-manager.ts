import path from 'node:path';
import { createFiles } from './create-files/create-files.js';
import type { CreateFileError } from './errors/create-file.error.js';
import { buildOperations } from './operations/build-operations.js';
import type { FileTreeInterface } from './types/file-tree.types.js';
import type {
  DirOperationsType,
  ExtraOperationsInterface,
  OperationsRecord,
} from './types/index.js';

export type CreateFilesFn = () => CreateFileError[];

export class FileManager<
  ExtraFileOperations extends OperationsRecord | undefined = undefined,
  ExtraDirOperations extends OperationsRecord | undefined = undefined,
> {
  #extraOperations: ExtraOperationsInterface<
    ExtraFileOperations,
    ExtraDirOperations
  >;

  constructor(
    extraOperations: ExtraOperationsInterface<
      ExtraFileOperations,
      ExtraDirOperations
    > = {},
  ) {
    this.#extraOperations = extraOperations;
  }

  mount<Tree extends FileTreeInterface>(
    rootPath: string,
    tree?: Tree,
  ): [
    DirOperationsType<Tree, ExtraFileOperations, ExtraDirOperations>,
    CreateFilesFn,
  ] {
    const rootPathResolved = path.isAbsolute(rootPath)
      ? rootPath
      : path.resolve(rootPath);
    const operations = buildOperations(
      rootPathResolved,
      tree,
      this.#extraOperations,
    );

    return [operations, () => createFiles(operations)];
  }

  /**
   * Identity function that helps create a file tree
   */
  static tree<Tree extends FileTreeInterface>(tree: Tree): Tree {
    return tree;
  }

  /**
   * Identity function that helps create extra operations
   */
  static extend<
    ExtraFileOperations extends OperationsRecord | undefined,
    ExtraDirOperations extends OperationsRecord | undefined,
  >(
    extraOperations: ExtraOperationsInterface<
      ExtraFileOperations,
      ExtraDirOperations
    >,
  ): ExtraOperationsInterface<ExtraFileOperations, ExtraDirOperations> {
    return extraOperations;
  }
}

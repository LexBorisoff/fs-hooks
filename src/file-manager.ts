import path from 'node:path';
import { createFiles } from './create-files/create-files.js';
import { buildOperations } from './operations/build-operations.js';
import type { FileTreeInterface } from './types/file-tree.types.js';
import type {
  DirOperationsType,
  ExtensionsInterface,
  OperationsRecord,
} from './types/index.js';

export type CreateFilesFn = () => void;

export class FileManager<
  ExtraFileOperations extends OperationsRecord | undefined = undefined,
  ExtraDirOperations extends OperationsRecord | undefined = undefined,
> {
  #extensions: ExtensionsInterface<ExtraFileOperations, ExtraDirOperations>;

  constructor(
    extensions: ExtensionsInterface<
      ExtraFileOperations,
      ExtraDirOperations
    > = {},
  ) {
    this.#extensions = extensions;
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
      this.#extensions,
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
   * Identity function that helps create extensions
   */
  static extend<
    FileOperations extends OperationsRecord | undefined,
    DirOperations extends OperationsRecord | undefined,
    Extensions = ExtensionsInterface<FileOperations, DirOperations>,
  >(extensions: Extensions): Extensions {
    return extensions;
  }
}

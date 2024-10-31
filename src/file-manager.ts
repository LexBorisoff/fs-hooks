import path from 'node:path';
import type { FileTreeInterface } from './file-tree/file-tree.types.js';
import { buildOperationTree } from './operations/build-operation-tree.js';
import type {
  ExtensionsInterface,
  FileTreeOperationsType,
  OperationsRecord,
} from './operations/operation.types.js';

export class FileManager<
  ExtraFileOperations extends OperationsRecord = OperationsRecord,
  ExtraDirOperations extends OperationsRecord = OperationsRecord,
> {
  #extensions?: ExtensionsInterface<ExtraFileOperations, ExtraDirOperations>;

  constructor(
    extensions?: ExtensionsInterface<ExtraFileOperations, ExtraDirOperations>,
  ) {
    this.#extensions = extensions;
  }

  mount<Tree extends FileTreeInterface>(
    rootPath: string,
    tree?: Tree,
  ): FileTreeOperationsType<Tree, ExtraFileOperations, ExtraDirOperations> {
    const extensions = this.#extensions;

    const rootPathResolved = path.isAbsolute(rootPath)
      ? rootPath
      : path.resolve(rootPath);

    return buildOperationTree(rootPathResolved, tree, extensions);
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
    FileOperations extends OperationsRecord,
    DirOperations extends OperationsRecord,
  >(
    extensions: ExtensionsInterface<FileOperations, DirOperations>,
  ): ExtensionsInterface<FileOperations, DirOperations> {
    return extensions;
  }
}

import path from 'node:path';
import type { FileTreeInterface } from './types/file-tree.types.js';
import type {
  ExtensionsInterface,
  OperationsType,
  OperationsRecord,
} from './types/index.js';
import { buildOperations } from './operations/build-operations.js';

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
  ): OperationsType<Tree, ExtraFileOperations, ExtraDirOperations> {
    const extensions = this.#extensions;

    const rootPathResolved = path.isAbsolute(rootPath)
      ? rootPath
      : path.resolve(rootPath);

    return buildOperations(rootPathResolved, tree, extensions);
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
    Extensions = ExtensionsInterface<FileOperations, DirOperations>,
  >(extensions: Extensions): Extensions {
    return extensions;
  }
}

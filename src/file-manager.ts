import path from 'node:path';
import type { FileTreeInterface } from './file-tree/file-tree.types.js';
import { buildOperationTree } from './operations/build-operation-tree.js';
import type {
  CustomOperationsInterface,
  RootOperationTreeType,
  OperationsType,
} from './operations/operation.types.js';

export class FileManager<
  CustomFileOperations extends OperationsType = OperationsType,
  CustomDirOperations extends OperationsType = OperationsType,
> {
  #customOperations?: CustomOperationsInterface<
    CustomFileOperations,
    CustomDirOperations
  >;

  constructor(
    customOperations?: CustomOperationsInterface<
      CustomFileOperations,
      CustomDirOperations
    >,
  ) {
    this.#customOperations = customOperations;
  }

  mount<Tree extends FileTreeInterface>(
    rootPath: string,
    tree?: Tree,
  ): RootOperationTreeType<Tree, CustomFileOperations, CustomDirOperations> {
    const customOperations = this.#customOperations;

    const rootPathResolved = path.isAbsolute(rootPath)
      ? rootPath
      : path.resolve(rootPath);

    return buildOperationTree(rootPathResolved, tree, customOperations);
  }

  /**
   * Identity function that helps create a file tree
   */
  static tree<T extends FileTreeInterface>(tree: T): T {
    return tree;
  }

  /**
   * Identity function that helps create extensions
   */
  static extend<
    FileOperations extends OperationsType,
    DirOperations extends OperationsType,
  >(
    extensions: CustomOperationsInterface<FileOperations, DirOperations>,
  ): CustomOperationsInterface<FileOperations, DirOperations> {
    return extensions;
  }
}

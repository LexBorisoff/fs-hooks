import { createOperationTree } from './operations/create-operation-tree.js';
import type { FileTreeInterface } from './types/file-tree.types.js';
import type { OperationTreeType } from './types/operation.types.js';

export class FileManager {
  #root: string;

  constructor(root: string) {
    // TODO: what to do if root does not exist?
    this.#root = root;
  }

  files<T extends FileTreeInterface>(tree: T): OperationTreeType<T> {
    return createOperationTree(this.#root, tree);
  }
}

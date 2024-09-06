import fs from 'node:fs';
import type { OperationTreeInterface } from './operations/index.js';
import type { FileTreeInterface } from './types/file-tree.types.js';
import { operationsMapper } from './mappers/operations.mapper.js';
import { pathsMapper } from './mappers/paths.mapper.js';

export class FileTree<T extends FileTreeInterface> {
  #fileTree: T;

  constructor(fileTree: T) {
    this.#fileTree = fileTree;
  }

  get tree(): T {
    return this.#fileTree;
  }

  root(rootPath: string): OperationTreeInterface<T> {
    if (fs.existsSync(rootPath)) {
      throw new Error('Path does not exist');
    }

    const pathTree = pathsMapper(rootPath, this.#fileTree);
    return operationsMapper(pathTree);
  }
}

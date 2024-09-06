import fs from 'node:fs';
import type { FileTree, PathTree } from './types/file-tree.types.js';
import { OperationsBuilder } from './operations-builder.js';

export class AppBuilder<T extends FileTree> extends OperationsBuilder<T> {
  constructor(rootPath: string, fileTree: T) {
    if (!fs.existsSync(rootPath)) {
      throw new Error('Path does not exist');
    }

    super(rootPath, fileTree);
  }

  initialize(): void {
    if (!this.#exists(this.root)) {
      fs.mkdirSync(this.root);
    }

    this.#createFiles(this.pathTree);
  }

  #exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  #createFiles(pathTree: PathTree<T>): void {
    Object.values(pathTree).forEach((file) => {
      if (file.type === 'file') {
        if (file.skip) {
          return;
        }

        fs.writeFileSync(
          file.path,
          (file.data instanceof Function ? file.data() : file.data) ?? '',
        );
        return;
      }

      if (!fs.existsSync(file.path)) {
        fs.mkdirSync(file.path);
      }

      if (file.children != null && Object.keys(file.children).length > 0) {
        this.#createFiles(file.children);
      }
    });
  }
}

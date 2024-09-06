import fs from 'node:fs';
import { pathsMapper } from './mappers/paths.mapper.js';
import type { FileTreeInterface } from './types/file-tree.types.js';
import type { FileTree } from './file-tree.js';
import type { OperationTreeInterface } from './operations/index.js';

export type Operations<T extends FileTreeInterface | undefined> =
  T extends FileTreeInterface ? OperationTreeInterface<T> : null;

export interface BaseAppOptions<T extends FileTreeInterface> {
  fileTree?: FileTree<T>;
}

export class BaseApp<T extends FileTreeInterface> {
  #rootPath: string;

  #fileTree?: FileTree<T>;

  constructor(rootPath: string, { fileTree }: BaseAppOptions<T> = {}) {
    if (!fs.existsSync(rootPath)) {
      throw new Error('Path does not exist');
    }

    this.#rootPath = rootPath;
    this.#fileTree = fileTree;
  }

  protected get rootPath(): string {
    return this.#rootPath;
  }

  protected get fileTree(): FileTree<T> | undefined {
    return this.#fileTree;
  }

  initialize(): void {
    if (!this.#exists(this.#rootPath)) {
      fs.mkdirSync(this.#rootPath);
    }

    if (!this.#exists(this.#rootPath)) {
      fs.mkdirSync(this.#rootPath);
    }

    if (this.#fileTree != null) {
      const pathTree = pathsMapper(this.#rootPath, this.#fileTree.tree);
      this.#createFiles(pathTree);
    }
  }

  root(): Operations<T> {
    return (
      this.#fileTree == null ? null : this.#fileTree.root(this.#rootPath)
    ) as Operations<T>;
  }

  #exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  #createFiles<F extends FileTreeInterface<true>>(fileTree: F): void {
    Object.values(fileTree).forEach((file) => {
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

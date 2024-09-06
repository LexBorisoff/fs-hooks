import path from 'node:path';
import type {
  DirWithPath,
  FileTree,
  FileWithPath,
  PathTree,
} from './types/file-tree.types.js';

export class PathTreeBuilder<T extends FileTree<false>> {
  #rootPath: string;

  #fileTree: T;

  constructor(rootPath: string, fileTree: T) {
    this.#rootPath = rootPath;
    this.#fileTree = fileTree;
  }

  get root(): string {
    return this.#rootPath;
  }

  get pathTree(): PathTree<T> {
    return this.#pathMapper(this.#rootPath, this.#fileTree);
  }

  static createTree<Tree extends FileTree>(tree: Tree): Tree {
    return tree;
  }

  #pathMapper<Tree extends FileTree>(
    parentPath: string,
    fileTree: Tree,
  ): PathTree<Tree> {
    const result = {} as PathTree<Tree>;

    Object.entries(fileTree).forEach(([key, value]) => {
      const filePath = path.join(parentPath, key);

      if (value.type === 'file') {
        const fileValue: FileWithPath<typeof value> = {
          ...value,
          path: filePath,
          parentPath,
        };

        Object.defineProperty(result, key, {
          enumerable: true,
          value: fileValue,
        });
        return;
      }

      const { children, ...rest } = value;
      const dirValue: DirWithPath = {
        ...rest,
        path: filePath,
        parentPath,
      };

      if (children != null && Object.keys(children).length > 0) {
        dirValue.children = this.#pathMapper(filePath, children);
      }

      Object.defineProperty(result, key, {
        enumerable: true,
        value: dirValue,
      });
    });

    return result;
  }
}

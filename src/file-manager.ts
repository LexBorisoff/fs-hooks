import fs from 'node:fs';
import path from 'node:path';
import { getFullPath } from './file-tree/get-full-path.js';
import { buildOperationTree } from './operations/build-operation-tree.js';
import type { FileTreeInterface } from './file-tree/file-tree.types.js';
import type {
  BuildOperationTreeType,
  CustomOperationsInterface,
  OperationsType,
} from './operations/operation.types.js';
import { isDirectory } from './utils/is-directory.js';
import { createDir } from './utils/create-dir.js';

export class FileManager<
  CustomFileOperations extends OperationsType | undefined,
  CustomDirOperations extends OperationsType | undefined,
> {
  #root: string;

  #customOperations: CustomOperationsInterface<
    CustomFileOperations,
    CustomDirOperations
  > = {};

  constructor(
    root: string,
    customOperations: CustomOperationsInterface<
      CustomFileOperations,
      CustomDirOperations
    > = {},
  ) {
    this.#root = path.resolve(root);
    this.#customOperations = customOperations;
  }

  get root(): string {
    return this.#root;
  }

  files<T extends FileTreeInterface>(
    tree: T,
  ): BuildOperationTreeType<T, CustomFileOperations, CustomDirOperations> {
    return buildOperationTree(this.#root, tree, this.#customOperations);
  }

  /**
   * Creates root path, if doesn't exist, and files provided in the tree argument
   */
  create<T extends FileTreeInterface>(tree: T): void {
    if (fs.existsSync(this.#root) && !isDirectory(this.#root)) {
      throw new Error('Root path already exists and is not a directory');
    }

    const errors: string[] = [];

    function addError(type: 'dir' | 'file', filePath: string): void {
      errors.push(
        `Cannot create ${type === 'file' ? 'file' : 'directory'} ${filePath}`,
      );
    }

    function createFiles<Tree extends FileTreeInterface>(
      parentPath: string,
      fileTree: Tree,
    ): void {
      Object.entries(fileTree).forEach(([key, value]) => {
        const withPath = {
          ...value,
          path: getFullPath(parentPath, key),
        };

        if (withPath.type === 'file') {
          if (fs.existsSync(withPath.path) && isDirectory(withPath.path)) {
            addError('file', withPath.path);
            return;
          }

          const { data } = withPath;
          const content = data instanceof Function ? data() : (data ?? '');
          fs.writeFileSync(withPath.path, content);
          return;
        }

        try {
          createDir(withPath.path);

          const { children } = withPath;
          if (children != null && Object.keys(children).length > 0) {
            createFiles(withPath.path, children);
          }
        } catch (error) {
          if (error instanceof Error) {
            errors.push(error.message);
          } else {
            addError('dir', withPath.path);
          }
        }
      });
    }

    try {
      if (!fs.existsSync(this.#root)) {
        createDir(this.#root);
      }

      createFiles(this.#root, tree);
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      } else {
        addError('dir', this.#root);
      }
    }

    if (errors.length > 0) {
      this.#logErrors(errors);
    }
  }

  #logErrors(errors: string[]): void {
    errors.forEach((error) => {
      console.error(error);
    });
  }
}

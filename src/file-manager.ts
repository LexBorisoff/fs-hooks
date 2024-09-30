import fs from 'node:fs';
import path from 'node:path';
import { getFullPath } from './file-tree/get-full-path.js';
import { buildOperationTree } from './operations/build-operation-tree.js';
import type {
  DirWithPathInterface,
  FileTreeInterface,
  FileWithPathInterface,
} from './file-tree/file-tree.types.js';
import type {
  CustomOperationsInterface,
  OperationsType,
} from './operations/operation.types.js';
import { isDirectory } from './utils/is-directory.js';
import { createDir } from './utils/create-dir.js';
import type {
  RootResultInterface,
  TreeResultInterface,
} from './file-manager.types.js';
import { buildFileTree } from './file-tree/build-file-tree.js';
import {
  buildDirOperations,
  buildFileOperations,
} from './operations/build-operations.js';

export class FileManager<
  CustomFileOperations extends OperationsType | undefined = undefined,
  CustomDirOperations extends OperationsType | undefined = undefined,
> {
  #customOperations: CustomOperationsInterface<
    CustomFileOperations,
    CustomDirOperations
  > = {};

  constructor(
    customOperations: CustomOperationsInterface<
      CustomFileOperations,
      CustomDirOperations
    > = {},
  ) {
    this.#customOperations = customOperations;
  }

  /**
   * @param root - Root path where to create and manipulate files
   */
  root(
    root: string,
  ): RootResultInterface<CustomFileOperations, CustomDirOperations> {
    return {
      /**
       * @param tree - Describes the structure of files at the `root` path
       */
      tree: (tree) => this.#tree(root, tree),
    };
  }

  #tree<T extends FileTreeInterface>(
    root: string,
    tree?: T,
  ): TreeResultInterface<T, CustomFileOperations, CustomDirOperations> {
    const rootPath = path.resolve(root);
    return {
      files: buildOperationTree(rootPath, tree, this.#customOperations),
      create: () => this.#create(rootPath, tree),
    };
  }

  #create<T extends FileTreeInterface>(root: string, tree?: T): void {
    const rootPath = path.resolve(root);
    if (fs.existsSync(rootPath) && !isDirectory(rootPath)) {
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
      fileTree?: Tree,
    ): void {
      Object.entries(fileTree ?? {}).forEach(([key, value]) => {
        const withPath = {
          ...value,
          path: getFullPath(parentPath, key),
        } satisfies FileWithPathInterface | DirWithPathInterface;

        if (withPath.type === 'file') {
          if (withPath.skip) {
            return;
          }

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
      if (!fs.existsSync(rootPath)) {
        createDir(rootPath);
      }

      createFiles(rootPath, tree);
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      } else {
        addError('dir', rootPath);
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

  // convenience static methods
  static buildFileTree = buildFileTree;

  static buildFileOperations = buildFileOperations;

  static buildDirOperations = buildDirOperations;
}

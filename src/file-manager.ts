import fs from 'node:fs';
import path from 'node:path';
import type { FileTreeInterface } from './file-tree/file-tree.types.js';
import { buildOperationTree } from './operations/build-operation-tree.js';
import type {
  CustomOperationsInterface,
  RootOperationTreeType,
  OperationsType,
} from './operations/operation.types.js';
import { isDirectory } from './utils/is-directory.js';
import { getFullPath } from './file-tree/get-full-path.js';
import { createDir } from './utils/create-dir.js';
import { getFileTree } from './file-tree/get-file-tree.js';
import {
  getDirOperations,
  getFileOperations,
} from './operations/get-operations.js';

export class FileManager<
  Tree extends FileTreeInterface,
  CustomFileOperations extends OperationsType | undefined = undefined,
  CustomDirOperations extends OperationsType | undefined = undefined,
> {
  #rootPath: string;

  #fileTree?: Tree;

  #operationTree: RootOperationTreeType<
    Tree,
    CustomFileOperations,
    CustomDirOperations
  >;

  constructor(
    rootPath: string,
    fileTree?: Tree,
    customOperations: CustomOperationsInterface<
      CustomFileOperations,
      CustomDirOperations
    > = {},
  ) {
    this.#rootPath = path.isAbsolute(rootPath)
      ? rootPath
      : path.resolve(rootPath);
    this.#fileTree = fileTree;
    this.#operationTree = buildOperationTree(
      rootPath,
      fileTree,
      customOperations,
    );
  }

  get operationTree(): RootOperationTreeType<
    Tree,
    CustomFileOperations,
    CustomDirOperations
  > {
    return this.#operationTree;
  }

  /**
   * Creates directories and files specified by the tree at the root path
   */
  mount(): void {
    const rootPath = this.#rootPath;
    if (fs.existsSync(rootPath) && !isDirectory(rootPath)) {
      throw new Error('Root path already exists and is not a directory');
    }

    const errors: string[] = [];

    function addError(type: 'dir' | 'file', filePath: string): void {
      errors.push(
        `Cannot create ${type === 'file' ? 'file' : 'directory'} ${filePath}`,
      );
    }

    function createFiles<T extends FileTreeInterface>(
      parentPath: string,
      fileTree?: T,
    ): void {
      Object.entries(fileTree ?? {}).forEach(([key, value]) => {
        const fullPath = getFullPath(parentPath, key);

        if (typeof value === 'string') {
          if (fs.existsSync(fullPath) && isDirectory(fullPath)) {
            addError('file', fullPath);
            return;
          }

          fs.writeFileSync(fullPath, value);
          return;
        }

        try {
          createDir(fullPath);

          if (Object.keys(value).length > 0) {
            createFiles(fullPath, value);
          }
        } catch (error) {
          if (error instanceof Error) {
            errors.push(error.message);
          } else {
            addError('dir', fullPath);
          }
        }
      });
    }

    try {
      if (!fs.existsSync(rootPath)) {
        createDir(rootPath);
      }

      createFiles(rootPath, this.#fileTree);
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
  static getFileTree = getFileTree;

  static getFileOperations = getFileOperations;

  static getDirOperations = getDirOperations;
}

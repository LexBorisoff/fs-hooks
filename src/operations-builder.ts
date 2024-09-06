import fs from 'node:fs';
import { readFile } from '@lexjs/cli-utils';
import { PathTreeBuilder } from './path-tree-builder.js';
import type {
  FileInterface,
  FileTree,
  FileWithPath,
  PathTree,
} from './types/file-tree.types.js';
import type {
  DirOperations,
  FileOperations,
  OperationTree,
} from './types/operation.types.js';

export class OperationsBuilder<T extends FileTree> extends PathTreeBuilder<T> {
  constructor(rootPath: string, fileTree: T) {
    super(rootPath, fileTree);
  }

  operations(): DirOperations & OperationTree<PathTree<T>> {
    const mapped = this.#operationMapper(this.pathTree);
    const dirOperations = {} as DirOperations;
    return { ...mapped, ...dirOperations };
  }

  #operationMapper<Tree extends FileTree<true>>(
    fileTree: Tree,
  ): OperationTree<Tree> {
    const result = {} as OperationTree<Tree>;

    Object.entries(fileTree).forEach(([key, value]) => {
      if (value.type === 'file') {
        Object.defineProperty(result, key, {
          value: this.#fileOperations(value),
          enumerable: true,
        });
        return;
      }

      const { children } = value;
      if (children != null && Object.keys(children).length > 0) {
        Object.defineProperty(result, key, {
          value: this.#operationMapper(children),
          enumerable: true,
        });
        return;
      }

      Object.defineProperty(result, key, {
        value: {},
        enumerable: true,
      });
    });

    return result;
  }

  #fileOperations<File extends FileInterface>(
    file: FileWithPath<File>,
  ): FileOperations {
    return {
      read(): string | null {
        return readFile(file.path);
      },
      write(data): void {
        if (!fs.existsSync(file.parentPath)) {
          fs.mkdirSync(file.parentPath, {
            recursive: true,
          });
        }

        fs.writeFileSync(file.path, data instanceof Function ? data() : data);
      },
      clear(): void {
        if (this.exists()) {
          fs.writeFileSync(file.path, '');
        }
      },
      exists(): boolean {
        return fs.existsSync(file.path);
      },
    };
  }
}

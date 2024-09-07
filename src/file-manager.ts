import fs from 'node:fs';
import { readFile } from '@lexjs/cli-utils';
import type {
  FileInterface,
  FileTree,
  FileWithPath,
  PathTree,
} from './types/file-tree.types.js';
import type {
  DirOperations,
  FileOperations,
  GetFileOperationsFn,
  Operations,
  OperationTree,
} from './types/operation.types.js';
import { pathMapper } from './path-mapper.js';

interface FileManagerOptions<FileExtra extends Operations> {
  fileOperations?: GetFileOperationsFn<FileExtra>;
}

export class FileManager<
  FileExtra extends Operations,
  DirExtra extends Operations,
> {
  #fileOperations?: GetFileOperationsFn<FileExtra>;

  constructor({ fileOperations }: FileManagerOptions<FileExtra> = {}) {
    this.#fileOperations = fileOperations;
  }

  files<T extends FileTree>(
    rootPath: string,
    fileTree: T,
  ): DirOperations<FileExtra, DirExtra> &
    OperationTree<PathTree<T>, DirExtra, FileExtra> {
    const pathTree = pathMapper(rootPath, fileTree);
    const mapped = this.#operationMapper(pathTree);
    const dirOperations = {} as DirOperations<FileExtra, DirExtra>;
    return { ...mapped, ...dirOperations };
  }

  #operationMapper<Tree extends FileTree<true>>(
    fileTree: Tree,
  ): OperationTree<Tree, DirExtra, FileExtra> {
    const result = {} as OperationTree<Tree, DirExtra, FileExtra>;

    Object.entries(fileTree).forEach(([key, value]) => {
      if (value.type === 'file') {
        const operations = this.#createFileOperations(value);
        const extra = this.#fileOperations?.(value);

        Object.defineProperty(result, key, {
          value: { ...operations, ...extra },
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

  #createFileOperations<File extends FileInterface>(
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

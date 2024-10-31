import fs from 'node:fs';
import path from 'node:path';
import type {
  DirObjectInterface,
  FileObjectInterface,
  FileTreeInterface,
  FileTreeType,
} from '../types/file-tree.types.js';
import type {
  FileTreeOperationsType,
  ExtensionsInterface,
  DirOperationsInterface,
  OperationsRecord,
  FileOperationsInterface,
} from '../types/operation.types.js';
import { createDir } from '../utils/create-dir.js';
import { readFile } from '../utils/read-file.js';

export const TREE_SYM = Symbol('tree');

function buildFileTree<T extends FileTreeInterface>(
  parentPath: string,
  tree?: T,
): FileTreeType<T> {
  let result = {} as FileTreeType<T>;

  Object.entries(tree ?? {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const file: FileObjectInterface = {
        data: value,
        path: path.resolve(parentPath, key),
      };

      result = {
        ...result,
        [key]: file,
      };
      return;
    }

    if (typeof value === 'object') {
      const dirPath = path.resolve(parentPath, key);
      const dir: DirObjectInterface<typeof value> = {
        children: buildFileTree(dirPath, value),
        path: dirPath,
      };

      result = {
        ...result,
        [key]: dir,
      };
    }
  });

  return result;
}

function getFileOperations<F extends FileObjectInterface>(
  file: F,
): FileOperationsInterface {
  const operations: FileOperationsInterface = {
    $getPath: () => file.path,
    $clear() {
      this.$write('');
    },
    $read: () => readFile(file.path),
    $write(data) {
      const content = data instanceof Function ? data() : data;
      fs.writeFileSync(file.path, content);
    },
  };

  return operations;
}

function getDirOperations<
  ChildTree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord,
  ExtraDirOperations extends OperationsRecord,
>(
  dir: DirObjectInterface<ChildTree>,
  extensions: ExtensionsInterface<ExtraFileOperations, ExtraDirOperations>,
): DirOperationsInterface<ChildTree, ExtraFileOperations, ExtraDirOperations> {
  function getPath(fileName: string): string {
    return path.resolve(dir.path, fileName);
  }

  const operations: DirOperationsInterface<
    ChildTree,
    ExtraFileOperations,
    ExtraDirOperations
  > = {
    $getPath: () => dir.path,
    $exists: (fileName) => fs.existsSync(getPath(fileName)),
    $dirCreate(dirName) {
      type DirCreateResult = DirOperationsInterface<
        FileTreeInterface,
        ExtraFileOperations,
        ExtraDirOperations
      > &
        ExtraDirOperations;

      const dirPath = getPath(dirName);
      if (!this.$exists(dirName)) {
        createDir(dirPath);
      }

      const newDir = {
        path: dirPath,
        children: {},
      } satisfies DirObjectInterface<FileTreeInterface>;

      return {
        ...getDirOperations(newDir, extensions),
        ...extensions.dirOperations?.(newDir),
      } as DirCreateResult;
    },
    $dirDelete(dirName) {
      fs.rmSync(getPath(dirName), {
        recursive: true,
        force: true,
      });
    },
    $fileClear(fileName) {
      if (this.$exists(fileName)) {
        this.$fileWrite(fileName, '');
      }
    },
    $fileCreate(fileName, fileData) {
      type FileCreateResult = FileOperationsInterface & ExtraFileOperations;

      const data = fileData ?? '';
      this.$fileWrite(fileName, data);

      const file: FileObjectInterface = {
        data,
        path: getPath(fileName),
      };

      return {
        ...getFileOperations(file),
        ...extensions.fileOperations?.(file),
      } as FileCreateResult;
    },
    $fileDelete(fileName) {
      fs.rmSync(getPath(fileName));
    },
    $fileRead: (fileName) => readFile(getPath(fileName)),
    $fileWrite(fileName, fileData) {
      fs.writeFileSync(getPath(fileName), fileData);
    },
  };

  return operations;
}

export function buildOperations<
  Tree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord,
  ExtraDirOperations extends OperationsRecord,
>(
  parentPath: string,
  tree?: Tree,
  extensions: ExtensionsInterface<ExtraFileOperations, ExtraDirOperations> = {},
): FileTreeOperationsType<Tree, ExtraFileOperations, ExtraDirOperations> {
  const {
    fileOperations: extraFileOperations,
    dirOperations: extraDirOperations,
  } = extensions;

  const rootDir = {
    children: buildFileTree(parentPath, tree),
    path: parentPath,
  } satisfies DirObjectInterface<Tree>;

  const rootOperations: DirOperationsInterface<
    Tree,
    ExtraFileOperations,
    ExtraDirOperations
  > = getDirOperations(rootDir, extensions);

  const rootExtraOperations = extraDirOperations?.(rootDir);

  let result = {
    ...rootOperations,
    ...rootExtraOperations,
  } as FileTreeOperationsType<Tree, ExtraFileOperations, ExtraDirOperations>;

  Object.entries(tree ?? {}).forEach(([key, value]) => {
    const fullPath = path.resolve(parentPath, key);

    if (typeof value === 'string') {
      const file: FileObjectInterface = {
        data: value,
        path: fullPath,
      };

      const operations = {
        ...getFileOperations(file),
        ...(extraFileOperations?.(file) as ExtraFileOperations),
      };

      result = {
        ...result,
        [key]: operations,
      };
      return;
    }

    if (typeof value === 'object') {
      const childTreeOperations = buildOperations(fullPath, value, extensions);

      const dir: DirObjectInterface<typeof value> = {
        children: buildFileTree(parentPath, value),
        path: fullPath,
      };

      const operations: DirOperationsInterface<
        typeof value,
        ExtraFileOperations,
        ExtraDirOperations
      > = {
        ...getDirOperations(dir, extensions),
        ...(extraDirOperations?.(dir) as ExtraDirOperations),
        ...childTreeOperations,
      };

      result = {
        ...result,
        [key]: operations,
      };
    }
  });

  Object.defineProperties(result, {
    [TREE_SYM]: { value: tree },
  });

  return result;
}

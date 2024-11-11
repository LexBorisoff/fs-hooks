import fs from 'node:fs';
import path from 'node:path';
import type {
  DirObjectInterface,
  FileObjectInterface,
  FileTreeInterface,
  FileTreeType,
} from '../types/file-tree.types.js';
import type {
  ExtraOperationsInterface,
  FileOperationsInterface,
  DirOperationsInterface,
  DirOperationsType,
  OperationsRecord,
  FileOperationsType,
} from '../types/operation.types.js';
import { createDir } from '../utils/create-dir.js';
import { readFile } from '../utils/read-file.js';
import {
  OPERATIONS_TYPE_SYM,
  TREE_VALUE_SYM,
} from './utils/operation.constants.js';
import { OperationsTypeEnum } from './utils/operations-type.enum.js';

function buildFileTree<Tree extends FileTreeInterface>(
  parentPath: string,
  tree?: Tree,
): FileTreeType<Tree> {
  let result = {} as FileTreeType<Tree>;

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
  Tree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord | undefined = undefined,
  ExtraDirOperations extends OperationsRecord | undefined = undefined,
>(
  dir: DirObjectInterface<FileTreeInterface>,
  extraOperations: ExtraOperationsInterface<
    ExtraFileOperations,
    ExtraDirOperations
  >,
): DirOperationsInterface<Tree, ExtraFileOperations, ExtraDirOperations> {
  function getPath(fileName: string): string {
    return path.resolve(dir.path, fileName);
  }

  const operations: DirOperationsInterface<
    Tree,
    ExtraFileOperations,
    ExtraDirOperations
  > = {
    $getPath: () => dir.path,
    $exists: (fileName) => fs.existsSync(getPath(fileName)),
    $dirCreate(dirName) {
      type DirCreateResult = DirOperationsType<
        Tree,
        ExtraFileOperations,
        ExtraDirOperations
      >;

      const dirPath = getPath(dirName);
      if (!this.$exists(dirName)) {
        createDir(dirPath);
      }

      const newDir = {
        path: dirPath,
        children: {},
      } satisfies DirObjectInterface<FileTreeInterface>;

      return {
        ...getDirOperations(newDir, extraOperations),
        ...extraOperations.dir?.(newDir),
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
      type FileCreateResult = FileOperationsType<ExtraFileOperations>;

      const data = fileData ?? '';
      this.$fileWrite(fileName, data);

      const file: FileObjectInterface = {
        data,
        path: getPath(fileName),
      };

      return {
        ...getFileOperations(file),
        ...extraOperations.file?.(file),
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
  ExtraFileOperations extends OperationsRecord | undefined = undefined,
  ExtraDirOperations extends OperationsRecord | undefined = undefined,
>(
  parentPath: string,
  tree?: Tree,
  extraOperations: ExtraOperationsInterface<
    ExtraFileOperations,
    ExtraDirOperations
  > = {},
): DirOperationsType<Tree, ExtraFileOperations, ExtraDirOperations> {
  const rootDir = {
    children: buildFileTree(parentPath, tree),
    path: parentPath,
  } satisfies DirObjectInterface<Tree>;

  const rootOperations: DirOperationsInterface<
    Tree,
    ExtraFileOperations,
    ExtraDirOperations
  > = getDirOperations(rootDir, extraOperations);

  const rootExtraOperations = extraOperations.dir?.(rootDir);

  let result = {
    ...rootOperations,
    ...rootExtraOperations,
  } as DirOperationsType<Tree, ExtraFileOperations, ExtraDirOperations>;

  Object.entries(tree ?? {}).forEach(([key, value]) => {
    const fullPath = path.resolve(parentPath, key);

    if (typeof value === 'string') {
      const file: FileObjectInterface = {
        data: value,
        path: fullPath,
      };

      const operations: FileOperationsType<OperationsRecord | undefined> = {
        ...getFileOperations(file),
        ...extraOperations.file?.(file),
      };

      Object.defineProperties(operations, {
        [TREE_VALUE_SYM]: { value },
        [OPERATIONS_TYPE_SYM]: {
          value: OperationsTypeEnum.File,
        },
      });

      result = {
        ...result,
        [key]: operations,
      };
      return;
    }

    if (typeof value === 'object') {
      const childTreeOperations = buildOperations(
        fullPath,
        value,
        extraOperations,
      );

      const dir: DirObjectInterface<FileTreeInterface> = {
        children: buildFileTree(parentPath, value),
        path: fullPath,
      };

      const operations: DirOperationsType<
        FileTreeInterface,
        ExtraFileOperations,
        ExtraDirOperations
      > = {
        ...getDirOperations(dir, extraOperations),
        ...extraOperations.dir?.(dir),
        ...childTreeOperations,
      };

      Object.defineProperties(operations, {
        [TREE_VALUE_SYM]: { value },
        [OPERATIONS_TYPE_SYM]: {
          value: OperationsTypeEnum.Dir,
        },
      });

      result = {
        ...result,
        [key]: operations,
      };
    }
  });

  Object.defineProperties(result, {
    [TREE_VALUE_SYM]: {
      value: tree,
    },
    [OPERATIONS_TYPE_SYM]: {
      value: OperationsTypeEnum.Dir,
    },
  });

  return result;
}

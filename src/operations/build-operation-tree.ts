import fs from 'node:fs';
import { getFullPath } from '../file-tree/get-full-path.js';
import type {
  DirObjectInterface,
  FileObjectInterface,
  FileTreeInterface,
  FileTreeType,
} from '../file-tree/file-tree.types.js';
import { createDir } from '../utils/create-dir.js';
import { readFile } from '../utils/read-file.js';
import type {
  RootOperationTreeType,
  CustomOperationsInterface,
  DirOperationsInterface,
  OperationsType,
  FileOperationsInterface,
} from './operation.types.js';

function buildFileTree<T extends FileTreeInterface>(
  parentPath: string,
  tree?: T,
): FileTreeType<T> {
  let result = {} as FileTreeType<T>;

  Object.entries(tree ?? {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const file: FileObjectInterface = {
        type: 'file',
        data: value,
        path: getFullPath(parentPath, key),
      };

      result = {
        ...result,
        [key]: file,
      };
      return;
    }

    const dirPath = getFullPath(parentPath, key);
    const dir: DirObjectInterface<typeof value> = {
      type: 'dir',
      children: buildFileTree(dirPath, value),
      path: dirPath,
    };

    result = {
      ...result,
      [key]: dir,
    };
  });

  return result;
}

function fileOperations<F extends FileObjectInterface>(
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

function dirOperations<
  ChildTree extends FileTreeInterface,
  CustomFileOperations extends OperationsType | undefined,
  CustomDirOperations extends OperationsType | undefined,
>(
  dir: DirObjectInterface<ChildTree>,
  customOperations: CustomOperationsInterface<
    CustomFileOperations,
    CustomDirOperations
  > = {},
): DirOperationsInterface<
  ChildTree,
  CustomFileOperations,
  CustomDirOperations
> {
  function getPath(fileName: string): string {
    return getFullPath(dir.path, fileName);
  }

  const operations: DirOperationsInterface<
    ChildTree,
    CustomFileOperations,
    CustomDirOperations
  > = {
    $getPath: () => dir.path,
    $exists: (fileName) => fs.existsSync(getPath(fileName)),
    $dirCreate(dirName) {
      type DirCreateResult = CustomDirOperations extends OperationsType
        ? CustomDirOperations &
            DirOperationsInterface<
              FileTreeInterface,
              CustomFileOperations,
              CustomDirOperations
            >
        : DirOperationsInterface<
            FileTreeInterface,
            CustomFileOperations,
            CustomDirOperations
          >;

      const dirPath = getPath(dirName);
      if (!this.$exists(dirName)) {
        createDir(dirPath);
      }

      const newDir = {
        type: 'dir',
        path: dirPath,
        children: {},
      } satisfies DirObjectInterface<FileTreeInterface>;

      return {
        ...dirOperations(newDir, customOperations),
        ...customOperations.dir?.(newDir),
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
      type FileCreateResult = CustomFileOperations extends OperationsType
        ? FileOperationsInterface & CustomFileOperations
        : FileOperationsInterface;

      const data = fileData ?? '';
      this.$fileWrite(fileName, data);

      const file: FileObjectInterface = {
        type: 'file',
        data,
        path: getPath(fileName),
      };

      return {
        ...fileOperations(file),
        ...customOperations.file?.(file),
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

export function buildOperationTree<
  Tree extends FileTreeInterface,
  CustomFileOperations extends OperationsType | undefined,
  CustomDirOperations extends OperationsType | undefined,
>(
  parentPath: string,
  tree?: Tree,
  customOperations: CustomOperationsInterface<
    CustomFileOperations,
    CustomDirOperations
  > = {},
): RootOperationTreeType<Tree, CustomFileOperations, CustomDirOperations> {
  const { file: customFileOperations, dir: customDirOperations } =
    customOperations;

  const rootDir = {
    type: 'dir',
    children: buildFileTree(parentPath, tree),
    path: parentPath,
  } satisfies DirObjectInterface<Tree>;

  const rootOperations: DirOperationsInterface<
    Tree,
    CustomFileOperations,
    CustomDirOperations
  > = dirOperations(rootDir, customOperations);

  const rootCustomOperations = customDirOperations?.(rootDir);

  let result = {
    ...rootOperations,
    ...rootCustomOperations,
  } as RootOperationTreeType<Tree, CustomFileOperations, CustomDirOperations>;

  Object.entries(tree ?? {}).forEach(([key, value]) => {
    const fullPath = getFullPath(parentPath, key);

    if (typeof value === 'string') {
      const file: FileObjectInterface = {
        type: 'file',
        data: value,
        path: fullPath,
      };

      const operations = {
        ...fileOperations(file),
        ...(customFileOperations?.(file) as CustomFileOperations),
      };

      result = {
        ...result,
        [key]: operations,
      };
      return;
    }

    const childTree = buildOperationTree(fullPath, value, customOperations);

    const dir: DirObjectInterface<typeof value> = {
      type: 'dir',
      children: buildFileTree(parentPath, value),
      path: fullPath,
    };

    const operations: DirOperationsInterface<
      typeof value,
      CustomFileOperations,
      CustomDirOperations
    > = {
      ...dirOperations(dir),
      ...(customDirOperations?.(dir) as CustomDirOperations),
      ...childTree,
    };

    result = {
      ...result,
      [key]: operations,
    };
  });

  return result;
}

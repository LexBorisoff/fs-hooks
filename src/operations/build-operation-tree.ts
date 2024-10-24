import fs from 'node:fs';
import { getFullPath } from '../file-tree/get-full-path.js';
import type {
  DirInterface,
  DirWithPathInterface,
  DirWithPathType,
  FileInterface,
  FileTreeInterface,
  FileWithPathInterface,
  FileWithPathType,
} from '../file-tree/file-tree.types.js';
import { createDir } from '../utils/create-dir.js';
import { readFile } from '../utils/read-file.js';
import type {
  FileTreeOperationsType,
  CustomOperationsInterface,
  DirOperationsInterface,
  OperationsType,
  FileOperationsInterface,
} from './operation.types.js';

function fileOperations<F extends FileInterface>(
  file: FileWithPathType<F>,
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
  D extends DirInterface,
  P extends DirWithPathType<D>,
  CustomFileOperations extends OperationsType | undefined,
  CustomDirOperations extends OperationsType | undefined,
>(
  dir: P,
  customOperations: CustomOperationsInterface<
    CustomFileOperations,
    CustomDirOperations
  > = {},
): DirOperationsInterface<
  P['children'],
  CustomFileOperations,
  CustomDirOperations
> {
  function getPath(fileName: string): string {
    return getFullPath(dir.path, fileName);
  }

  const operations: DirOperationsInterface<
    (typeof dir)['children'],
    CustomFileOperations,
    CustomDirOperations
  > = {
    $getPath: () => dir.path,
    $exists: (fileName) => fs.existsSync(getPath(fileName)),
    $dirCreate(dirName) {
      type DirCreateResult = CustomDirOperations extends OperationsType
        ? CustomDirOperations &
            DirOperationsInterface<
              undefined,
              CustomFileOperations,
              CustomDirOperations
            >
        : DirOperationsInterface<
            undefined,
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
      } satisfies DirWithPathInterface;

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
    $fileCreate(fileName, data) {
      type FileCreateResult = CustomFileOperations extends OperationsType
        ? FileOperationsInterface & CustomFileOperations
        : FileOperationsInterface;

      this.$fileWrite(fileName, data ?? '');

      const file: FileWithPathInterface = {
        type: 'file',
        data,
        path: getPath(fileName),
        skip: false,
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
    $fileWrite(fileName, data) {
      const content = data instanceof Function ? data() : data;
      fs.writeFileSync(getPath(fileName), content);
    },
  };

  return operations;
}

export function buildOperationTree<
  T extends FileTreeInterface,
  CustomFileOperations extends OperationsType | undefined,
  CustomDirOperations extends OperationsType | undefined,
>(
  parentPath: string,
  tree?: T,
  customOperations: CustomOperationsInterface<
    CustomFileOperations,
    CustomDirOperations
  > = {},
): FileTreeOperationsType<T, CustomFileOperations, CustomDirOperations> {
  const { file: customFileOperations, dir: customDirOperations } =
    customOperations;

  const rootDir = {
    type: 'dir',
    children: tree,
    path: parentPath,
  } satisfies DirWithPathInterface;

  const rootOperations: DirOperationsInterface<
    T,
    CustomFileOperations,
    CustomDirOperations
  > = dirOperations(rootDir, customOperations);

  const rootCustomOperations = customDirOperations?.(rootDir);

  let result = {
    ...rootOperations,
    ...rootCustomOperations,
  } as FileTreeOperationsType<T, CustomFileOperations, CustomDirOperations>;

  Object.entries(tree ?? {}).forEach(([key, value]) => {
    const withPath = {
      ...value,
      path: getFullPath(parentPath, key),
    } satisfies FileWithPathInterface | DirWithPathInterface;

    if (withPath.type === 'file') {
      const operations = {
        ...fileOperations(withPath),
        ...(customFileOperations?.(withPath) as CustomFileOperations),
      };

      result = {
        ...result,
        [key]: operations,
      };
      return;
    }

    const { children } = withPath;
    const childTree =
      children != null
        ? buildOperationTree(withPath.path, children, customOperations)
        : null;

    const operations: DirOperationsInterface<
      typeof children,
      CustomFileOperations,
      CustomDirOperations
    > = {
      ...dirOperations(withPath, customOperations),
      ...(customDirOperations?.(withPath) as CustomDirOperations),
      ...childTree,
    };

    result = {
      ...result,
      [key]: operations,
    };
  });

  return result;
}

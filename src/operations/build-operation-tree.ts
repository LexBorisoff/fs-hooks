import path from 'node:path';
import { getFullPath } from '../utils/get-full-path.js';
import type { FileTreeInterface } from '../types/file-tree.types.js';
import type {
  CreateOperationTreeType,
  CustomOperationsInterface,
  DirOperationsInterface,
  OperationsType,
} from '../types/operation.types.js';
import { dirOperations } from './dir-operations.js';
import { fileOperations } from './file-operations.js';

export function buildOperationTree<
  T extends FileTreeInterface,
  FileOperations extends OperationsType | undefined,
  DirOperations extends OperationsType | undefined,
>(
  parentPath: string,
  tree: T,
  customOperations: CustomOperationsInterface<
    FileOperations,
    DirOperations
  > = {},
): CreateOperationTreeType<T, FileOperations, DirOperations> {
  const { file: getFileOperations, dir: getDirOperations } = customOperations;

  const rootDir = {
    type: 'dir',
    children: tree,
    path: parentPath,
    parentPath: path.resolve(parentPath, '..'),
  } as const;

  const rootOperations: DirOperationsInterface<T, FileOperations> =
    dirOperations(rootDir, customOperations);

  const extraRootOperations = getDirOperations?.(rootDir);

  let result = {
    ...rootOperations,
    ...extraRootOperations,
  } as CreateOperationTreeType<T, FileOperations, DirOperations>;

  Object.entries(tree).forEach(([key, value]) => {
    const withPath = {
      ...value,
      path: getFullPath(parentPath, key),
    };

    if (withPath.type === 'file') {
      result = {
        ...result,
        [key]: {
          ...fileOperations(withPath),
          ...getFileOperations?.(withPath),
        },
      };
      return;
    }

    const { children } = withPath;
    const childTree =
      children != null
        ? buildOperationTree(withPath.path, children, customOperations)
        : undefined;

    const dir: DirOperationsInterface<
      typeof children,
      FileOperations,
      DirOperations
    > = {
      ...dirOperations(withPath),
      ...(getDirOperations?.(withPath) as DirOperations),
      ...childTree,
    };

    result = {
      ...result,
      [key]: dir,
    };
  });

  return result;
}

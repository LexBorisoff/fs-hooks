import path from 'node:path';
import { getFullPath } from '../file-tree/get-full-path.js';
import type { FileTreeInterface } from '../file-tree/file-tree.types.js';
import type {
  CreateOperationTreeType,
  CustomOperationsInterface,
  DirOperationsInterface,
  OperationsType,
} from './operation.types.js';
import { dirOperations } from './dir-operations.js';
import { fileOperations } from './file-operations.js';

export function buildOperationTree<
  T extends FileTreeInterface,
  CustomFileOperations extends OperationsType | undefined,
  CustomDirOperations extends OperationsType | undefined,
>(
  parentPath: string,
  tree: T,
  customOperations: CustomOperationsInterface<
    CustomFileOperations,
    CustomDirOperations
  > = {},
): CreateOperationTreeType<T, CustomFileOperations, CustomDirOperations> {
  const { file: getFileOperations, dir: getDirOperations } = customOperations;

  const rootDir = {
    type: 'dir',
    children: tree,
    path: parentPath,
    parentPath: path.resolve(parentPath, '..'),
  } as const;

  const rootOperations: DirOperationsInterface<T, CustomFileOperations> =
    dirOperations(rootDir, customOperations);

  const extraRootOperations = getDirOperations?.(rootDir);

  let result = {
    ...rootOperations,
    ...extraRootOperations,
  } as CreateOperationTreeType<T, CustomFileOperations, CustomDirOperations>;

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
      CustomFileOperations,
      CustomDirOperations
    > = {
      ...dirOperations(withPath),
      ...(getDirOperations?.(withPath) as CustomDirOperations),
      ...childTree,
    };

    result = {
      ...result,
      [key]: dir,
    };
  });

  return result;
}

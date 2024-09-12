import { getFullPath } from '../file-tree/get-full-path.js';
import type {
  DirWithPathInterface,
  FileTreeInterface,
  FileWithPathInterface,
} from '../file-tree/file-tree.types.js';
import type {
  BuildOperationTreeType,
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
  tree?: T,
  customOperations: CustomOperationsInterface<
    CustomFileOperations,
    CustomDirOperations
  > = {},
): BuildOperationTreeType<T, CustomFileOperations, CustomDirOperations> {
  const { file: customFileOperations, dir: customDirOperations } =
    customOperations;

  const rootDir = {
    type: 'dir',
    children: tree,
    path: parentPath,
  } satisfies DirWithPathInterface;

  const rootOperations: DirOperationsInterface<T, CustomFileOperations> =
    dirOperations(rootDir, customOperations);

  const rootCustomOperations = customDirOperations?.(rootDir);

  let result = {
    ...rootOperations,
    ...rootCustomOperations,
  } as BuildOperationTreeType<T, CustomFileOperations, CustomDirOperations>;

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
      CustomFileOperations
    > = {
      ...dirOperations(withPath),
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

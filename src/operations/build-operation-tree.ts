import path from 'node:path';
import { getFullPath } from '../utils/get-full-path.js';
import type { FileTreeInterface } from '../types/file-tree.types.js';
import type {
  CreateOperationTreeType,
  DirOperationsInterface,
} from '../types/operation.types.js';
import { dirOperations } from './dir-operations.js';
import { fileOperations } from './file-operations.js';

export function buildOperationTree<T extends FileTreeInterface>(
  parentPath: string,
  tree: T,
): CreateOperationTreeType<T> {
  const rootOperations: DirOperationsInterface<T> = dirOperations({
    type: 'dir',
    children: tree,
    path: parentPath,
    parentPath: path.resolve(parentPath, '..'),
  });

  let result = { ...rootOperations } as CreateOperationTreeType<T>;

  Object.entries(tree).forEach(([key, value]) => {
    const withPath = {
      ...value,
      path: getFullPath(parentPath, key),
    };

    if (withPath.type === 'file') {
      result = {
        ...result,
        [key]: fileOperations(withPath),
      };
      return;
    }

    const { children } = withPath;
    const childTree =
      children != null
        ? buildOperationTree(withPath.path, children)
        : undefined;

    const dir: DirOperationsInterface<typeof children> = {
      ...dirOperations(withPath),
      ...childTree,
    };

    result = {
      ...result,
      [key]: dir,
    };
  });

  return result;
}

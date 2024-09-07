import path from 'node:path';
import { addPath } from '../file-tree/add-path.js';
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
    const withPath = addPath(parentPath, key, value);

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

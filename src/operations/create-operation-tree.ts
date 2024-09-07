import { addPath } from '../file-tree/add-path.js';
import type { FileTreeInterface } from '../types/file-tree.types.js';
import type {
  DirOperationsInterface,
  OperationTreeType,
} from '../types/operation.types.js';
import { dirOperations } from './dir-operations.js';
import { fileOperations } from './file-operations.js';

export function createOperationTree<T extends FileTreeInterface>(
  parentPath: string,
  tree: T,
): OperationTreeType<T> {
  let result = {} as OperationTreeType<T>;

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
        ? createOperationTree(withPath.path, children)
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

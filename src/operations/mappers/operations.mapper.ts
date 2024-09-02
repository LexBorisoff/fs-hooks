import type { FileTree, PathTree } from '../../types/file-tree.types.js';
import type { OperationTree } from '../types/operations.types.js';
import { fileOperations } from '../file-operations.js';

export function operationsMapper<T extends FileTree, P extends PathTree<T>>(
  pathTree: P,
): OperationTree<T> {
  const result = {} as OperationTree<T>;

  Object.entries(pathTree).forEach(([key, value]) => {
    if (value.type === 'file') {
      Object.defineProperty(result, key, {
        value: fileOperations(value),
        enumerable: true,
      });
      return;
    }

    const { children } = value;
    if (children != null && Object.keys(children).length > 0) {
      Object.defineProperty(result, key, {
        value: operationsMapper(children),
        enumerable: true,
      });
      return;
    }

    Object.defineProperty(result, key, {
      value: {},
      enumerable: true,
    });
  });

  return result;
}

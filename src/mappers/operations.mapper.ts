import type {
  FileTreeInterface,
  PathTreeInterface,
} from '../types/file-tree.types.js';
import type { OperationTreeInterface } from '../operations/types/operations.types.js';
import { fileOperations } from '../operations/file-operations.js';

export function operationsMapper<
  T extends FileTreeInterface,
  P extends PathTreeInterface<T>,
>(pathTree: P): OperationTreeInterface<T> {
  const result = {} as OperationTreeInterface<T>;

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

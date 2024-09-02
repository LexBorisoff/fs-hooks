import type {
  FileStructure,
  PathStructure,
} from '../../types/file-structure.types.js';
import type { OperationStructure } from '../types/operations.types.js';
import { fileOperations } from '../file-operations.js';

export function operationsMapper<
  S extends FileStructure,
  P extends PathStructure<S>,
>(pathStructure: P): OperationStructure<S> {
  const result = {} as OperationStructure<S>;

  Object.entries(pathStructure).forEach(([key, value]) => {
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

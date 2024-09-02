import type { FileStructure } from '../../types/file-structure.types.js';
import type { OperationStructure } from '../types/operations.types.js';
import { fileOperations } from '../file-operations.js';

export function operationsMapper<
  S extends FileStructure<true>,
  R extends FileStructure<false>,
>(structure: S): OperationStructure<R> {
  const result = {} as OperationStructure<R>;

  Object.entries(structure).forEach(([key, value]) => {
    if (value.type === 'file') {
      Object.defineProperty(result, key, {
        value: fileOperations(value),
        enumerable: true,
      });
      return;
    }

    if (value.children != null && Object.keys(value.children).length > 0) {
      Object.defineProperty(result, key, {
        value: operationsMapper(value.children),
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

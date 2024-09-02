import type { AppActions } from '../types/app-actions.types.js';
import type { FileStructure } from '../types/app-structure.types.js';
import { getFileActions } from '../get-file-actions.js';

export function actionsMapper<
  S extends FileStructure<true>,
  R extends FileStructure<false>,
>(structure: S): AppActions<R> {
  const result = {} as AppActions<R>;

  Object.entries(structure).forEach(([key, value]) => {
    if (value.type === 'file') {
      Object.defineProperty(result, key, {
        value: getFileActions(value),
        enumerable: true,
      });
      return;
    }

    if (value.children != null && Object.keys(value.children).length > 0) {
      Object.defineProperty(result, key, {
        value: actionsMapper(value.children),
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

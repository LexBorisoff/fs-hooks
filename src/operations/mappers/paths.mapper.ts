import path from 'node:path';
import { getAppHomedir } from '../../app-homedir.js';
import type { FileStructure } from '../../types/file-structure.types.js';

export function pathsMapper<S extends FileStructure<false>>(
  appName: string,
  structure: S,
): FileStructure<true> {
  const appDir = getAppHomedir(appName);
  const result = {} as FileStructure<true>;

  function createPaths<K extends keyof FileStructure>(
    parentDir: string,
    key: K,
    value: FileStructure[K],
  ) {
    const filePath = path.join(parentDir, key);

    if (value.type === 'file') {
      Object.defineProperties(value, {
        path: {
          value: filePath,
          enumerable: true,
        },
        parentPath: {
          value: parentDir,
          enumerable: true,
        },
      });
    }

    if (
      value.type === 'dir' &&
      value.children != null &&
      Object.keys(value.children).length > 0
    ) {
      Object.entries(value.children).forEach(([childKey, childValue]) => {
        Object.defineProperty(value, childKey, {
          value: childValue,
          enumerable: true,
          writable: childValue.type === 'file',
        });

        createPaths(filePath, childKey, childValue);
      });
    }
  }

  Object.entries(structure).forEach(([key, value]) => {
    Object.defineProperty(result, key, {
      value,
      enumerable: true,
      writable: value.type === 'file',
    });

    createPaths(appDir, key, value);
  });

  return result;
}

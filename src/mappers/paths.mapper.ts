import path from 'node:path';
import type {
  AppDir,
  AppFile,
  FileTreeInterface,
  PathTreeInterface,
} from '../types/file-tree.types.js';

export function pathsMapper<T extends FileTreeInterface>(
  parentPath: string,
  fileTree: T,
): PathTreeInterface<T> {
  const result = {} as PathTreeInterface<T>;

  Object.entries(fileTree).forEach(([key, value]) => {
    const filePath = path.join(parentPath, key);

    if (value.type === 'file') {
      const fileValue: AppFile<true> = {
        ...value,
        path: filePath,
        parentPath,
      };

      Object.defineProperty(result, key, {
        enumerable: true,
        value: fileValue,
      });
      return;
    }

    const { children, ...rest } = value;
    const dirValue: AppDir<true> = {
      ...rest,
      path: filePath,
      parentPath,
    };

    if (children != null && Object.keys(children).length > 0) {
      dirValue.children = pathsMapper(filePath, children);
    }

    Object.defineProperty(result, key, {
      enumerable: true,
      value: dirValue,
    });
  });

  return result;
}

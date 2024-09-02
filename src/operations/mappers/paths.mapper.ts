import path from 'node:path';
import type {
  AppDir,
  AppFile,
  FileTree,
  PathTree,
} from '../../types/file-structure.types.js';

export function pathsMapper<T extends FileTree>(
  parentPath: string,
  fileTree: T,
): PathTree<T> {
  const result = {} as PathTree<T>;

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

import path from 'node:path';
import type {
  DirWithPath,
  FileTree,
  FileWithPath,
  PathTree,
} from './types/file-tree.types.js';

export function pathMapper<T extends FileTree>(
  parentPath: string,
  fileTree: T,
): PathTree<T> {
  const result = {} as PathTree<T>;

  Object.entries(fileTree).forEach(([key, value]) => {
    const filePath = path.join(parentPath, key);

    if (value.type === 'file') {
      const fileValue: FileWithPath<typeof value> = {
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
    const dirValue: DirWithPath = {
      ...rest,
      path: filePath,
      parentPath,
    };

    if (children != null && Object.keys(children).length > 0) {
      dirValue.children = pathMapper(filePath, children);
    }

    Object.defineProperty(result, key, {
      enumerable: true,
      value: dirValue,
    });
  });

  return result;
}

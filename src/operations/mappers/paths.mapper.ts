import path from 'node:path';
import type {
  AppDir,
  AppFile,
  FileStructure,
  PathStructure,
} from '../../types/file-structure.types.js';

export function pathsMapper<S extends FileStructure>(
  parentPath: string,
  fileStructure: S,
): PathStructure<S> {
  const result = {} as PathStructure<S>;

  Object.entries(fileStructure).forEach(([key, value]) => {
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

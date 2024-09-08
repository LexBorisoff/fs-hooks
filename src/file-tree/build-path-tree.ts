import type {
  DirWithPathType,
  FileTreeInterface,
  PathTreeType,
} from '../types/file-tree.types.js';
import { getFullPath } from '../utils/get-full-path.js';

export function buildPathTree<T extends FileTreeInterface>(
  parentPath: string,
  tree: T,
): PathTreeType<T> {
  let result = {} as PathTreeType<T>;

  Object.entries(tree).forEach(([key, value]) => {
    const withPath = {
      ...value,
      path: getFullPath(parentPath, key),
    };

    if (withPath.type === 'file') {
      result = {
        ...result,
        [key]: withPath,
      };
      return;
    }

    const { children } = withPath;
    const dir: DirWithPathType<typeof withPath> =
      children != null && Object.keys(children).length > 0
        ? {
            ...withPath,
            children: buildPathTree(withPath.path, children),
          }
        : withPath;

    result = {
      ...result,
      [key]: dir,
    };
  });

  return result;
}

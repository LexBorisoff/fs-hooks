import path from 'node:path';

import type {
  DirObjectInterface,
  FileObjectInterface,
  TreeInterface,
  TreeType,
} from '../types/tree.types.js';

export function buildObjectTree<Tree extends TreeInterface>(
  rootPath: string,
  tree: Tree,
): DirObjectInterface<Tree> {
  function traverseChildren<Children extends TreeInterface>(
    parentPath: string,
    children: Children,
  ): TreeType<Children> {
    let result = {} as TreeType<Children>;

    Object.entries(children).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const file: FileObjectInterface = {
          type: 'file',
          data: value,
          path: path.resolve(parentPath, key),
        };

        result = {
          ...result,
          [key]: file,
        };
        return;
      }

      if (typeof value === 'object') {
        const dirPath = path.resolve(parentPath, key);
        const dir: DirObjectInterface<typeof value> = {
          type: 'dir',
          path: dirPath,
          children: traverseChildren(dirPath, value),
        };

        result = {
          ...result,
          [key]: dir,
        };
      }
    });

    return result;
  }

  return {
    type: 'dir',
    path: rootPath,
    children: traverseChildren(rootPath, tree),
  };
}

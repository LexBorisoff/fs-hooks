import path from 'node:path';

import type {
  DirTargetInterface,
  FileTargetInterface,
  TreeInterface,
  ObjectTreeType,
} from '@app-types/tree.types.js';

export function buildObjectTree<Tree extends TreeInterface>(
  rootPath: string,
  tree: Tree,
): DirTargetInterface<Tree> {
  function traverseChildTree<ChildTree extends TreeInterface>(
    parentPath: string,
    childTree: ChildTree,
  ): ObjectTreeType<ChildTree> {
    let result = {} as ObjectTreeType<ChildTree>;

    Object.entries(childTree).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const file: FileTargetInterface = {
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
        const dir: DirTargetInterface<typeof value> = {
          type: 'dir',
          path: dirPath,
          children: traverseChildTree(dirPath, value),
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
    children: traverseChildTree(rootPath, tree),
  };
}

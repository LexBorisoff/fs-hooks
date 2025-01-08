import type { FsHooks } from '@app/fs-hooks.js';
import type { TreeInterface } from '@app-types/tree.types.js';

export interface DirInfo {
  children: string[];
  pathDirs: string[];
}

export function getDirsInfo(fsHooks: FsHooks<TreeInterface>): DirInfo[] {
  const dirs: DirInfo[] = [];

  (function traverse(
    dir: TreeInterface = fsHooks.tree,
    pathDirs: string[] = [],
  ): void {
    dirs.push({
      pathDirs,
      children: Object.keys(dir),
    });

    Object.entries(dir).forEach(([key, node]) => {
      if (typeof node === 'object') {
        traverse(node, pathDirs.concat(key));
      }
    });
  })();

  return dirs;
}

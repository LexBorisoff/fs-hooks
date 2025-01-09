import type { FsHooks } from '@app/fs-hooks.js';
import type { FileType, TreeInterface } from '@app-types/tree.types.js';

export interface FileInfo {
  fileData: FileType;
  fileName: string;
  pathDirs: string[];
}

export function getFilesInfo(fsHooks: FsHooks<TreeInterface>): FileInfo[] {
  const files: FileInfo[] = [];

  (function traverse(
    dir: TreeInterface = fsHooks.tree,
    pathDirs: string[] = [],
  ): void {
    Object.entries(dir).forEach(([key, node]) => {
      if (typeof node === 'string') {
        files.push({
          fileData: node,
          fileName: key,
          pathDirs,
        });
        return;
      }

      if (typeof node === 'object') {
        traverse(node, pathDirs.concat(key));
      }
    });
  })();

  return files;
}

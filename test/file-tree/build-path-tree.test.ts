import path from 'node:path';
import { test, expect } from 'vitest';
import { buildPathTree } from '../../src/file-tree/build-path-tree.js';
import type {
  FileTreeInterface,
  PathTreeType,
} from '../../src/file-tree/file-tree.types.js';
import { TESTS_ROOT } from '../constants.js';

test('buildPathTree', () => {
  const parentPath = path.join(TESTS_ROOT, 'file-tree', 'build-path-tree');
  const tree = {
    file1: {
      type: 'file',
    },
    dir1: {
      type: 'dir',
      children: {
        file2: {
          type: 'file',
        },
        dir2: {
          type: 'dir',
          children: {
            file3: {
              type: 'file',
            },
            dir3: {
              type: 'dir',
            },
          },
        },
      },
    },
  } satisfies FileTreeInterface;

  const pathTree: PathTreeType<typeof tree> = {
    file1: {
      type: 'file',
      path: path.join(parentPath, 'file1'),
    },
    dir1: {
      type: 'dir',
      path: path.join(parentPath, 'dir1'),
      children: {
        file2: {
          type: 'file',
          path: path.join(parentPath, 'dir1', 'file2'),
        },
        dir2: {
          type: 'dir',
          path: path.join(parentPath, 'dir1', 'dir2'),
          children: {
            file3: {
              type: 'file',
              path: path.join(parentPath, 'dir1', 'dir2', 'file3'),
            },
            dir3: {
              type: 'dir',
              path: path.join(parentPath, 'dir1', 'dir2', 'dir3'),
            },
          },
        },
      },
    },
  };

  const result = buildPathTree(parentPath, tree);
  expect(result).toEqual(pathTree);
});

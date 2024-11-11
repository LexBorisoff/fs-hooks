import type { FileTreeInterface } from '../src/types/file-tree.types.js';

const files = {
  file1: '',
  file2: 'Line 1',
  file3: 'Line 1\nLine 2',
  file4: 'Line 1\nLine 2\nLine 3',
} as const;

export const tree: FileTreeInterface = {
  ...files,
  dir1: {},
  dir2: {
    ...files,
    dir1: {},
    dir2: {
      ...files,
      dir1: {},
      dir2: {},
    },
  },
};

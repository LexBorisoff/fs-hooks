import type { FileTreeInterface } from '../src/types/file-tree.types.js';

interface Files {
  file1: string;
  file2: string;
  file3: string;
  file4: string;
}

const fileData = ['', 'Line 1', 'Line 1\nLine 2', 'Line 1\nLine 2\nLine 3'];

function files(): Files {
  return fileData.reduce<Files>((acc, data, i) => {
    return {
      ...acc,
      [`file${i + 1}`]: data,
    };
  }, {} as Files);
}

export const tree = {
  ...files(),
  dir1: {},
  dir2: {
    ...files(),
    dir1: {},
    dir2: {
      ...files(),
      dir1: {},
      dir2: {},
    },
  },
} satisfies FileTreeInterface;

export type Tree = typeof tree;

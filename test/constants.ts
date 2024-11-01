import { expect } from 'vitest';
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
    },
  },
} satisfies FileTreeInterface;

export type Tree = typeof tree;

export const fileOperationsObject = {
  $getPath: expect.any(Function),
  $read: expect.any(Function),
  $write: expect.any(Function),
  $clear: expect.any(Function),
};

export const dirOperationsObject = {
  $getPath: expect.any(Function),
  $exists: expect.any(Function),
  $dirCreate: expect.any(Function),
  $dirDelete: expect.any(Function),
  $fileClear: expect.any(Function),
  $fileCreate: expect.any(Function),
  $fileDelete: expect.any(Function),
  $fileRead: expect.any(Function),
  $fileWrite: expect.any(Function),
};

export const KEEP_TEST_FOLDER: boolean =
  process.env.KEEP_TEST_FOLDER === 'true';

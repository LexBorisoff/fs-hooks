import { expect } from 'vitest';
import type { FileTreeInterface } from '../../../src/file-tree/file-tree.types.js';

export const tree = {
  file1: '',
  file2: 'File 2 test',
  dir1: {},
  dir2: {
    file1: '',
    file2: 'Dir 2\nFile 2 test',
    dir1: {},
    dir2: {
      file1: 'Dir2 2\nDir2 2\nFile 1 test',
      file2: 'Dir2 2\nDir2 2\nFile 2 test',
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

export enum Test {
  CoreProperties = 'core-properties',
  CoreFileOperations = 'core-file-operations',
  CoreDirOperations = 'core-dir-operations',
  ExtraFileOperations = 'extra-file-operations',
  ExtraDirOperations = 'extra-dir-operations',
}

export const fileDataArray = [
  '',
  'New File Test 1',
  'New File Test 1\nNew File Test 2',
  'New File Test 1\nNew File Test 2\nNew File Test 3',
];

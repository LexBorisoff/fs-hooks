import { expect } from 'vitest';
import type { FileTreeInterface } from '../../../src/file-tree/file-tree.types.js';

export const tree = {
  file1: { type: 'file' },
  file2: { type: 'file', data: 'File 2 test', skip: true },
  dir1: { type: 'dir' },
  dir2: {
    type: 'dir',
    children: {
      file1: { type: 'file' },
      file2: {
        type: 'file',
        data: (): string => 'Dir 2\nFile 2 test',
        skip: false,
      },
      dir1: { type: 'dir' },
      dir2: {
        type: 'dir',
        children: {
          file1: { type: 'file', data: 'Dir 2\nDir 2\nFile 1 test' },
          file2: {
            type: 'file',
            data: (): string => 'Dir 2\nDir 2\nFile 2 test',
            skip: true,
          },
        },
      },
    },
  },
} satisfies FileTreeInterface;

export type Tree = typeof tree;

export const fileOperationsObject = {
  $getPath: expect.any(Function),
  $exists: expect.any(Function),
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
  CustomFileOperations = 'custom-file-operations',
  CustomDirOperations = 'custom-dir-operations',
}

export const fileDataArray = [
  '',
  'New File Test 1',
  'New File Test 1\nNew File Test 2',
  'New File Test 1\nNew File Test 2\nNew File Test 3',
];

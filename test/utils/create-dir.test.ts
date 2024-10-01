import fs from 'node:fs';
import { test, expect, beforeAll } from 'vitest';
import { createDir } from '../../src/utils/create-dir.js';
import { testSetup } from '../test-setup.js';

const { setup, joinPath } = testSetup('create-dir', import.meta);

beforeAll(() => {
  return setup();
});

test('createDir', () => {
  // attemp to create the directory with recursive flag set to false
  let dirPath: string = joinPath('dir1', 'dir2');
  expect(() => createDir(dirPath, false)).toThrow();

  // create a directory
  dirPath = joinPath('dir1');
  createDir(dirPath);
  expect(fs.existsSync(dirPath)).toBe(true);
  fs.rmSync(dirPath, { force: true, recursive: true });
  expect(fs.existsSync(dirPath)).toBe(false);

  // create a nested directory
  dirPath = joinPath('dir1', 'dir2');
  createDir(dirPath);
  expect(fs.existsSync(dirPath)).toBe(true);

  // attempt creating a directory at the existing path that is not a directory
  dirPath = joinPath('file1');
  fs.writeFileSync(dirPath, '');
  expect(() => createDir(dirPath)).toThrow();
});

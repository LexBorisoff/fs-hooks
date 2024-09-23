import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from 'vitest';
import { createDir } from '../../src/utils/create-dir.js';
import { TESTS_ROOT } from '../constants.js';

test('createDir', () => {
  const utilsPath = path.join(TESTS_ROOT, 'utils');
  const dirPath = path.join(utilsPath, 'create-dir');

  // attemp to create the directory with recursive flag set to false
  expect(() => createDir(dirPath, false)).toThrow();
  fs.rmSync(utilsPath, { force: true, recursive: true });

  // create a directory
  createDir(dirPath);
  expect(fs.existsSync(dirPath)).toBe(true);

  // attempt creating a directory at the existing path that is not a directory
  const filePath = path.join(dirPath, 'file');
  fs.writeFileSync(filePath, '');
  expect(() => createDir(filePath)).toThrow();
});

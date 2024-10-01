import path from 'node:path';
import { expect, test } from 'vitest';
import { getFullPath } from '../../src/file-tree/get-full-path.js';
import { testSetup } from '../test-setup.js';

const { testPath } = testSetup('get-full-path', import.meta);

test('getFullPath', () => {
  const args1 = ['dir1'];
  const args2 = ['dir1', 'dir2', 'dir3', 'file1'];

  const result1 = getFullPath(testPath);
  const result2 = getFullPath(testPath, ...args1);
  const result3 = getFullPath(testPath, ...args2);

  expect(result1).toBe(testPath);
  expect(result2).toBe(path.join(testPath, ...args1));
  expect(result3).toBe(path.join(testPath, ...args2));
});

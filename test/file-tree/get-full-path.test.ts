import path from 'node:path';
import { expect, test } from 'vitest';
import { getFullPath } from '../../src/file-tree/get-full-path.js';
import { TESTS_ROOT } from '../constants.js';

test('getFullPath', () => {
  const args1 = ['dir1'];
  const args2 = ['dir1', 'dir2', 'dir3', 'file1'];

  const result1 = getFullPath(TESTS_ROOT);
  const result2 = getFullPath(TESTS_ROOT, ...args1);
  const result3 = getFullPath(TESTS_ROOT, ...args2);

  expect(result1).toBe(TESTS_ROOT);
  expect(result2).toBe(path.join(TESTS_ROOT, ...args1));
  expect(result3).toBe(path.join(TESTS_ROOT, ...args2));
});

import path from 'node:path';
import { expect, test } from 'vitest';
import { getFullPath } from '../../src/file-tree/get-full-path.js';
import { TESTS_ROOT } from '../constants.js';

test('getFullPath', () => {
  const fullPath1 = path.join(TESTS_ROOT);
  const fullPath2 = path.join(TESTS_ROOT, 'dir1');
  const fullPath3 = path.join(TESTS_ROOT, 'dir1', 'dir2', 'dir3', 'file1');

  const result1 = getFullPath(TESTS_ROOT);
  const result2 = getFullPath(TESTS_ROOT, 'dir1');
  const result3 = getFullPath(TESTS_ROOT, 'dir1', 'dir2', 'dir3', 'file1');

  expect(result1).toBe(fullPath1);
  expect(result2).toBe(fullPath2);
  expect(result3).toBe(fullPath3);
});

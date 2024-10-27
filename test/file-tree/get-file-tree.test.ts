import { test, expect } from 'vitest';
import { getFileTree } from '../../src/file-tree/get-file-tree.js';
import type { FileTreeInterface } from '../../src/file-tree/file-tree.types.js';

test('getFileTree', () => {
  const tree: FileTreeInterface = {};
  const result = getFileTree(tree);
  expect(result).toBe(tree);
});

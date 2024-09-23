import { test, expect } from 'vitest';
import { buildFileTree } from '../../src/file-tree/build-file-tree.js';
import type { FileTreeInterface } from '../../src/file-tree/file-tree.types.js';

test('buildFileTree', () => {
  const tree: FileTreeInterface = {};
  const result = buildFileTree(tree);
  expect(result).toBe(tree);
});

import { describe, it, expect } from 'vitest';
import { getFileTree } from '../../src/file-tree/get-file-tree.js';
import type { FileTreeInterface } from '../../src/file-tree/file-tree.types.js';

describe('getFileTree', () => {
  it('should return the file tree object', () => {
    const tree: FileTreeInterface = {};
    const result = getFileTree(tree);
    expect(result).toBe(tree);
  });
});

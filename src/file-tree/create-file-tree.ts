import type { FileTreeInterface } from '../types/file-tree.types.js';

/**
 * Identity function to create a file tree
 */
export function createFileTree<T extends FileTreeInterface>(tree: T): T {
  return tree;
}

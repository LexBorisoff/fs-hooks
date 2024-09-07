import type { FileTreeInterface } from '../types/file-tree.types.js';

/**
 * Identity function to create a file tree
 */
export function buildFileTree<T extends FileTreeInterface>(tree: T): T {
  return tree;
}

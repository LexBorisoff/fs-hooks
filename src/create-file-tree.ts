import type { FileTree } from './types/file-tree.types.js';

/**
 * Identity function to create a file tree
 */
export function createFileTree<T extends FileTree>(fileTree: T): T {
  return fileTree;
}

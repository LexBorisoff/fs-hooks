import path from 'node:path';
import type {
  FileTreeInterface,
  PathInterface,
} from '../types/file-tree.types.js';

export function addPath<T extends FileTreeInterface>(
  parentPath: string,
  fileName: string,
  file: T[keyof T],
): T[keyof T] & PathInterface {
  return {
    ...file,
    parentPath,
    path: path.join(parentPath, fileName),
  };
}

import type {
  FileTreeInterface,
  FileType,
} from '../../types/file-tree.types.js';
import type {
  DirOperationsType,
  FileOperationsType,
} from '../../types/operation.types.js';
import { TREE_VALUE_SYM } from './operation.constants.js';

export function getTreeFile(operations: FileOperationsType): FileType {
  return Object.getOwnPropertyDescriptor(operations, TREE_VALUE_SYM)?.value;
}

export function getTreeDir<Tree extends FileTreeInterface>(
  operations: DirOperationsType<Tree>,
): Tree {
  return Object.getOwnPropertyDescriptor(operations, TREE_VALUE_SYM)?.value;
}

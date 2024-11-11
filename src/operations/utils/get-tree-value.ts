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

export function getTreeDir(
  operations: DirOperationsType<any>,
): FileTreeInterface {
  return Object.getOwnPropertyDescriptor(operations, TREE_VALUE_SYM)?.value;
}

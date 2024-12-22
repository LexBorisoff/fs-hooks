import { TREE_VALUE_SYM } from './constants.js';

import type {
  FileTreeInterface,
  FileType,
} from '@app-types/file-tree.types.js';
import type {
  DirOperationsType,
  FileOperationsType,
} from '@app-types/operation.types.js';

export function getTreeFile(operations: FileOperationsType): FileType {
  return Object.getOwnPropertyDescriptor(operations, TREE_VALUE_SYM)?.value;
}

export function getTreeDir(
  operations: DirOperationsType<any>,
): FileTreeInterface {
  return Object.getOwnPropertyDescriptor(operations, TREE_VALUE_SYM)?.value;
}

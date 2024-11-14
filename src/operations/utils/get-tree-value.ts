import type {
  FileTreeInterface,
  FileType,
  DirOperationsType,
  FileOperationsType,
} from '@app-types';
import { TREE_VALUE_SYM } from './constants.js';

export function getTreeFile(operations: FileOperationsType): FileType {
  return Object.getOwnPropertyDescriptor(operations, TREE_VALUE_SYM)?.value;
}

export function getTreeDir(
  operations: DirOperationsType<any>,
): FileTreeInterface {
  return Object.getOwnPropertyDescriptor(operations, TREE_VALUE_SYM)?.value;
}

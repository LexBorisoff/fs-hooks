import type { FileTreeInterface } from '../../types/file-tree.types.js';
import type {
  DirOperationsType,
  FileOperationsInterface,
  OperationsRecord,
} from '../../types/operation.types.js';
import { getOperationsType } from './get-operations-type.js';
import { OperationsTypeEnum } from './operations-type.enum.js';

// TODO: test
export function isFileOperations(
  value: unknown,
): value is FileOperationsInterface {
  const operationsType = getOperationsType(value);
  return operationsType === OperationsTypeEnum.File;
}

// TODO: test
export function isDirOperations<
  T extends FileTreeInterface,
  F extends OperationsRecord,
  D extends OperationsRecord,
>(value: unknown): value is DirOperationsType<T, F, D> {
  const operationsType = getOperationsType(value);
  return operationsType === OperationsTypeEnum.Dir;
}

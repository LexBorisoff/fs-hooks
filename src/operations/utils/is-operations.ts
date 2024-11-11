import type { FileTreeInterface } from '../../types/file-tree.types.js';
import type {
  DirOperationsType,
  FileOperationsType,
  OperationsRecord,
} from '../../types/operation.types.js';
import { getOperationsType } from './get-operations-type.js';
import { OperationsTypeEnum } from './operations-type.enum.js';

export function isFileOperations<
  ExtraFileOperations extends OperationsRecord | undefined,
>(value: unknown): value is FileOperationsType<ExtraFileOperations> {
  const operationsType = getOperationsType(value);
  return operationsType === OperationsTypeEnum.File;
}

export function isDirOperations<
  Tree extends FileTreeInterface,
  ExtraFileOperations extends OperationsRecord | undefined,
  ExtraDirOperations extends OperationsRecord | undefined,
>(
  value: unknown,
): value is DirOperationsType<Tree, ExtraFileOperations, ExtraDirOperations> {
  const operationsType = getOperationsType(value);
  return operationsType === OperationsTypeEnum.Dir;
}

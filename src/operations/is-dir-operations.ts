import type { FileTreeInterface } from '../types/file-tree.types.js';
import type {
  DirOperationsType,
  FileOperationsInterface,
} from '../types/operation.types.js';
import { OPERATIONS_TYPE_SYM } from './operation.constants.js';
import { OperationsTypeEnum } from './operations-type.enum.js';

// TODO: test
export function isDirOperations<
  FileOperations extends FileOperationsInterface,
  DirOperations extends DirOperationsType<FileTreeInterface>,
>(operations: FileOperations | DirOperations): operations is DirOperations {
  const operationsType = Object.getOwnPropertyDescriptor(
    operations,
    OPERATIONS_TYPE_SYM,
  )?.value;

  return operationsType === OperationsTypeEnum.Dir;
}

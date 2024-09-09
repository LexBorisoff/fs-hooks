import type {
  GetDirOperationsFn,
  GetFileOperationsFn,
  OperationsType,
} from './operation.types.js';

/**
 * Identity function that helps create a function
 * that returns custom file operations
 */
export function buildFileOperations<
  FileOperations extends OperationsType,
  Fn extends GetFileOperationsFn<FileOperations>,
>(getOperations: Fn): Fn {
  return getOperations;
}

/**
 * Identity function that helps create a function
 * that returns custom dir operations
 */
export function buildDirOperations<
  DirOperations extends OperationsType,
  Fn extends GetDirOperationsFn<DirOperations>,
>(getOperations: Fn): Fn {
  return getOperations;
}

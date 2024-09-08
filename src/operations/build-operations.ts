import type {
  GetDirOperationsFn,
  GetFileOperationsFn,
  OperationsType,
} from '../types/operation.types.js';

/**
 * Identity function that helps created a function
 * that returns custom file operations
 */
export function buildFileOperations<
  FileOperations extends OperationsType,
  F extends GetFileOperationsFn<FileOperations>,
>(getOperations: F): F {
  return getOperations;
}

/**
 * Identity function that helps created a function
 * that returns custom dir operations
 */
export function buildDirOperations<
  DirOperations extends OperationsType,
  F extends GetDirOperationsFn<DirOperations>,
>(getOperations: F): F {
  return getOperations;
}

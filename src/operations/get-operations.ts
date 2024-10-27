import type {
  GetDirOperationsFn,
  GetFileOperationsFn,
  OperationsType,
} from './operation.types.js';

/**
 * Identity function that helps create a function
 * that returns custom file operations
 */
export function getFileOperations<
  FileOperations extends OperationsType,
  Fn extends GetFileOperationsFn<FileOperations>,
>(cb: Fn): Fn {
  return cb;
}

/**
 * Identity function that helps create a function
 * that returns custom dir operations
 */
export function getDirOperations<
  DirOperations extends OperationsType,
  Fn extends GetDirOperationsFn<DirOperations>,
>(cb: Fn): Fn {
  return cb;
}

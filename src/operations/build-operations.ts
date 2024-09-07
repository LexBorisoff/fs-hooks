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
  K extends string,
  O extends OperationsType<K>,
  F extends GetFileOperationsFn<K, O>,
>(getOperations: F): F {
  return getOperations;
}

/**
 * Identity function that helps created a function
 * that returns custom dir operations
 */
export function buildDirOperations<
  K extends string,
  O extends OperationsType<K>,
  F extends GetDirOperationsFn<K, O>,
>(getOperations: F): F {
  return getOperations;
}

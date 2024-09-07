import type {
  GetFileOperationsFn,
  Operations,
} from './types/operation.types.js';

/**
 * Identity function that helps created a function
 * that returns custom file operations
 */
export function createFileOperations<
  O extends Operations,
  F extends GetFileOperationsFn<O>,
>(getOperations: F): F {
  return getOperations;
}

import { describe, it, expect } from 'vitest';
import {
  buildDirOperations,
  buildFileOperations,
} from '../../src/operations/build-operations.js';
import type {
  GetDirOperationsFn,
  GetFileOperationsFn,
  OperationsType,
} from '../../src/operations/operation.types.js';

describe('buildOperations function', () => {
  it('should return getOperations function for file operations', () => {
    const getOperations: GetFileOperationsFn<OperationsType> = () => ({
      custom(): void {},
    });
    const result = buildFileOperations(getOperations);
    expect(result).toBe(getOperations);
  });

  it('should return getOperations function for directory operations', () => {
    const getOperations: GetDirOperationsFn<OperationsType> = () => ({
      custom(): void {},
    });
    const result = buildDirOperations(getOperations);
    expect(result).toBe(getOperations);
  });
});

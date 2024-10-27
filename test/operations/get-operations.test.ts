import { describe, it, expect, suite } from 'vitest';
import {
  getDirOperations,
  getFileOperations,
} from '../../src/operations/get-operations.js';
import type {
  GetDirOperationsFn,
  GetFileOperationsFn,
  OperationsType,
} from '../../src/operations/operation.types.js';

suite('getOperations Suite', () => {
  describe('getFileOperations function', () => {
    it('should return a function for getting file operations', () => {
      const getOperations: GetFileOperationsFn<OperationsType> = () => ({
        custom(): void {},
      });
      const result = getFileOperations(getOperations);
      expect(result).toBe(getOperations);
    });
  });

  describe('getDirOperations function', () => {
    it('should return a function for getting directory operations', () => {
      const getOperations: GetDirOperationsFn<OperationsType> = () => ({
        custom(): void {},
      });
      const result = getDirOperations(getOperations);
      expect(result).toBe(getOperations);
    });
  });
});

import { describe, it, expect, suite } from 'vitest';
import {
  buildDirOperations,
  buildFileOperations,
} from '../../src/operations/build-operations.js';
import type {
  GetDirOperationsFn,
  GetFileOperationsFn,
  OperationsType,
} from '../../src/operations/operation.types.js';

suite('buildOperations Suite', () => {
  describe('buildFileOperations function', () => {
    it('should return a function for getting file operations', () => {
      const getOperations: GetFileOperationsFn<OperationsType> = () => ({
        custom(): void {},
      });
      const result = buildFileOperations(getOperations);
      expect(result).toBe(getOperations);
    });
  });

  describe('buildDirOperations function', () => {
    it('should return a function for getting directory operations', () => {
      const getOperations: GetDirOperationsFn<OperationsType> = () => ({
        custom(): void {},
      });
      const result = buildDirOperations(getOperations);
      expect(result).toBe(getOperations);
    });
  });
});

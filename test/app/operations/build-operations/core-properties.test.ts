import { beforeAll, beforeEach, expect, it, suite } from 'vitest';
import { buildOperations } from '@app/operations/build-operations.js';
import type { FileTreeInterface, DirOperationsType } from '@app-types';
import { testSetup } from '@test-setup';
import {
  dirOperationsObject,
  operationsTreeObject,
} from '@test-utils/operations-objects.js';
import { tree } from '@test-utils/tree.js';
import { Test } from './test.enum.js';

const { setup, testPath } = testSetup(Test.CoreProperties, import.meta);

suite('buildOperations - core properties', { concurrent: false }, () => {
  beforeAll(() => setup());

  let result: DirOperationsType<FileTreeInterface>;

  beforeEach(() => {
    result = buildOperations(testPath, tree);
  });

  it('should be defined', () => {
    expect(result).toBeDefined();
  });

  it('should be operations tree object', () => {
    expect(result).toEqual(operationsTreeObject);
  });

  it('should build operations when tree is undefined', () => {
    const operations = buildOperations(testPath);
    expect(operations).toEqual(dirOperationsObject);
  });
});

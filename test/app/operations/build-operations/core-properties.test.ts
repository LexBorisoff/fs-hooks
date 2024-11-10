import { beforeAll, beforeEach, expect, it, suite } from 'vitest';
import { buildOperations } from '../../../../src/operations/build-operations.js';
import type { DirOperationsType } from '../../../../src/types/operation.types.js';
import { operationsTreeObject } from '../../../operations-objects.js';
import { testSetup } from '../../../test-setup.js';
import { tree, type Tree } from '../../../tree.js';
import { Test } from './constants.js';

const { setup, testPath } = testSetup(Test.CoreProperties, import.meta);

suite('buildOperations - core properties', { concurrent: false }, () => {
  beforeAll(() => setup());

  let result: DirOperationsType<Tree>;

  beforeEach(() => {
    result = buildOperations(testPath, tree);
  });

  it('should be defined', () => {
    expect(result).toBeDefined();
  });

  it('should be operations tree object', () => {
    expect(result).toEqual(operationsTreeObject);
  });
});

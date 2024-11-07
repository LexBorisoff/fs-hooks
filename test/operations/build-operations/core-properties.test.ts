import { beforeAll, beforeEach, expect, it, suite } from 'vitest';
import type { OperationsType } from '../../../src/types/operation.types.js';
import { buildOperations } from '../../../src/operations/build-operations.js';
import { TREE_SYM } from '../../../src/operations/operation.constants.js';
import { testSetup } from '../../test-setup.js';
import { tree, type Tree } from '../../tree.js';
import { operationsTreeObject } from '../../operations-objects.js';
import { Test } from './constants.js';

const { setup: setupSuite, joinPath } = testSetup(
  Test.CoreProperties,
  import.meta,
);

suite('buildOperations - core properties', { concurrent: false }, () => {
  let result: OperationsType<Tree>;

  beforeAll(() => {
    return setupSuite();
  });

  beforeEach(() => {
    result = buildOperations(joinPath(), tree);
  });

  it('should be defined', () => {
    expect(result).toBeDefined();
  });

  it('should be operations tree object', () => {
    expect(result).toEqual(operationsTreeObject);
  });

  it('should have a symbol property key with file tree value', () => {
    const descriptor = Object.getOwnPropertyDescriptor(result, TREE_SYM);
    expect(descriptor?.value).toBe(tree);
  });
});

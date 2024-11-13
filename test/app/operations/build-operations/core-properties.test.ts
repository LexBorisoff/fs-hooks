import { beforeAll, beforeEach, expect, it, suite } from 'vitest';
import { buildOperations } from '../../../../src/operations/build-operations.js';
import type { FileTreeInterface } from '../../../../src/types/file-tree.types.js';
import type { DirOperationsType } from '../../../../src/types/operation.types.js';
import { operationsTreeObject } from '../../../../test-utils/operations-objects.js';
import { tree } from '../../../../test-utils/tree.js';
import { testSetup } from '../../../test-setup.js';
import { Test } from './constants.js';

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
});

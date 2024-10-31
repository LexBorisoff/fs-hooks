import { beforeAll, beforeEach, expect, it, suite } from 'vitest';
import { buildOperations } from '../../../src/operations/build-operations.js';
import type { FileTreeOperationsType } from '../../../src/operations/operation.types.js';
import { testSetup } from '../../test-setup.js';
import {
  dirOperationsObject,
  fileOperationsObject,
  Test,
  tree,
  type Tree,
} from './constants.js';

const { setup: setupSuite, joinPath } = testSetup(
  Test.CoreProperties,
  import.meta,
);

suite('buildOperations - core properties', { concurrent: false }, () => {
  let result: FileTreeOperationsType<Tree>;

  beforeAll(() => {
    return setupSuite();
  });

  beforeEach(() => {
    result = buildOperations(joinPath(), tree);
  });

  it('should be defined', () => {
    expect(result).toBeDefined();
  });

  it('should have directory operation methods on result object', () => {
    expect(result).toEqual({
      ...dirOperationsObject,
      file1: fileOperationsObject,
      file2: fileOperationsObject,
      dir1: dirOperationsObject,
      dir2: {
        ...dirOperationsObject,
        file1: fileOperationsObject,
        file2: fileOperationsObject,
        dir1: dirOperationsObject,
        dir2: {
          ...dirOperationsObject,
          file1: fileOperationsObject,
          file2: fileOperationsObject,
        },
      },
    });
  });
});

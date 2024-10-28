import { beforeAll, beforeEach, expect, it, suite } from 'vitest';
import { buildOperationTree } from '../../../src/operations/build-operation-tree.js';
import type { RootOperationTreeType } from '../../../src/operations/operation.types.js';
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

suite('buildOperationTree - core properties', { concurrent: false }, () => {
  let result: RootOperationTreeType<Tree>;

  beforeAll(() => {
    return setupSuite();
  });

  beforeEach(() => {
    result = buildOperationTree(joinPath(), tree);
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

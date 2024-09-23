import { describe } from 'vitest';
import { useTestSuite } from '../use-suite.js';
import { TestSuite } from '../test-suite.enum.js';
import { testCreateFileManager } from './test-create-file-manager.js';
import { testRootMethod } from './test-root-method.js';
import { testTreeMethod } from './test-tree-method.js';
import { testCreateMethod } from './test-create-method.js';
import { testFileOperations } from './test-file-operations.js';

const { getTestRoot, setup } = useTestSuite(TestSuite.FileManager);

const testRoots: Record<string, string> = {
  rootMethod: getTestRoot('root-method'),
  treeMethod: getTestRoot('tree-method'),
  createMethod: getTestRoot('create-method'),
  fileOperations: getTestRoot('file-operations'),
};

describe('File Manager without custom operations', () => {
  setup();

  testCreateFileManager();

  testRootMethod(testRoots.rootMethod);

  testTreeMethod(testRoots.treeMethod);

  testCreateMethod(testRoots.createMethod);

  testFileOperations(testRoots.fileOperations);
});
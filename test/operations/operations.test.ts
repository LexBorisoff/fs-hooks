import { suite } from 'vitest';
import { useTestSuite } from '../use-suite.js';
import { TestSuite } from '../test-suite.enum.js';
import { testGetPath } from './test-get-path.js';
import { testExists } from './test-exists.js';
import { testDirCreate } from './test-dir-create.js';
import { testFileCreate } from './test-file-create.js';
import { testDirDelete } from './test-dir-delete.js';
import { testProperties } from './test-properties.js';

const { getTestRoot, setup } = useTestSuite(TestSuite.Operations);

const testRoots: Record<string, string> = {
  properties: getTestRoot('properties'),
  getPath: getTestRoot('get-path'),
  exists: getTestRoot('exists'),
  dirCreate: getTestRoot('dir-create'),
  dirDelete: getTestRoot('dir-delete'),
  fileCreate: getTestRoot('file-create'),
};

suite('File manager operations', () => {
  setup();

  testProperties(testRoots.properties);

  testGetPath(testRoots.getPath);

  testExists(testRoots.exists);

  testDirCreate(testRoots.dirCreate);

  testDirDelete(testRoots.dirDelete);

  testFileCreate(testRoots.fileCreate);
});

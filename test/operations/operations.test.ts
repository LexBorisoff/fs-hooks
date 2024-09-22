import { describe } from 'vitest';
import { useTestSuite } from '../use-suite.js';
import { TestSuite } from '../test-suite.enum.js';
import { testGetPath } from './test-get-path.js';
import { testExists } from './test-exists.js';
import { testDirCreate } from './test-dir-create.js';
import { testFileCreate } from './test-file-create.js';
import { testDirDelete } from './test-dir-delete.js';

const { getTestRoot, setup } = useTestSuite(TestSuite.Operations);

const testRoots: Record<string, string> = {
  getPath: getTestRoot('get-path'),
  exists: getTestRoot('exists'),
  dirCreate: getTestRoot('dir-create'),
  dirDelete: getTestRoot('dir-delete'),
  fileCreate: getTestRoot('file-create'),
};

describe('File manager operations', () => {
  setup();

  testGetPath(testRoots.getPath);

  testExists(testRoots.exists);

  testDirCreate(testRoots.dirCreate);

  testDirDelete(testRoots.dirDelete);

  testFileCreate(testRoots.fileCreate);
});

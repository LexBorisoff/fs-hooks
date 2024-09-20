import { describe } from 'vitest';
import { useTestSuite } from '../use-suite.js';
import { TestSuite } from '../test-suite.enum.js';
import { testGetPath } from './test-get-path.js';
import { testExists } from './test-exists.js';
import { testDirCreate } from './test-dir-create.js';
import { testFileCreate } from './test-file-create.js';

const { getTestRoot, setup } = useTestSuite(TestSuite.Operations);

describe('File manager operations', () => {
  setup();

  testGetPath(getTestRoot('get-path'));

  testExists(getTestRoot('exists'));

  testDirCreate(getTestRoot('dir-create'));

  testFileCreate(getTestRoot('file-create'));
});

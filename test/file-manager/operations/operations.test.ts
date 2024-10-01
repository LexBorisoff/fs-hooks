import { beforeAll, suite } from 'vitest';
import { testSetup } from '../../test-setup.js';
import { testGetPath } from './test-get-path.js';
import { testExists } from './test-exists.js';
import { testDirCreate } from './test-dir-create.js';
import { testFileCreate } from './test-file-create.js';
import { testDirDelete } from './test-dir-delete.js';
import { testProperties } from './test-properties.js';

const { testPath, setup, joinPath } = testSetup('operations', import.meta);

const testRoots: Record<string, string> = {
  properties: joinPath('properties'),
  getPath: joinPath('get-path'),
  exists: joinPath('exists'),
  dirCreate: joinPath('dir-create'),
  dirDelete: joinPath('dir-delete'),
  fileCreate: joinPath('file-create'),
};

suite.skip('File manager operations', () => {
  beforeAll(() => {
    return setup();
  });

  testProperties(testRoots.properties);

  testGetPath(testRoots.getPath);

  testExists(testRoots.exists);

  testDirCreate(testRoots.dirCreate);

  testDirDelete(testRoots.dirDelete);

  testFileCreate(testRoots.fileCreate);
});

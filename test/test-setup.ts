import fs from 'node:fs';
import url from 'node:url';
import path from 'node:path';
import { KEEP_TEST_FOLDER } from './constants.js';
import { deleteFolder } from './utils.js';

type CleanupFn = () => void;

interface TestSetup {
  testRoot: string;
  setup: () => CleanupFn;
}

export function testSetup(testName: string, meta: ImportMeta): TestSetup {
  const __dirname = url.fileURLToPath(new URL('.', meta.url));
  const testRoot = path.join(__dirname, `__test__${testName}`);

  return {
    testRoot,
    setup() {
      deleteFolder(testRoot);
      fs.mkdirSync(testRoot);

      return function () {
        if (!KEEP_TEST_FOLDER) {
          deleteFolder(testRoot);
        }
      };
    },
  };
}

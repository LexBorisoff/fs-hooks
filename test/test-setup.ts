import fs from 'node:fs';
import url from 'node:url';
import path from 'node:path';
import { KEEP_TEST_FOLDER } from './constants.js';
import { deleteFolder } from './utils.js';

type CleanupFn = () => void;

interface TestSetup {
  testPath: string;
  setup: () => CleanupFn;
  joinPath: (...args: string[]) => string;
}

export function testSetup(testName: string, meta: ImportMeta): TestSetup {
  const __dirname = url.fileURLToPath(new URL('.', meta.url));
  const testPath = path.join(__dirname, `__test__${testName}`);

  const result: TestSetup = {
    testPath,
    setup() {
      deleteFolder(testPath);
      fs.mkdirSync(testPath);

      return function () {
        if (!KEEP_TEST_FOLDER) {
          deleteFolder(testPath);
        }
      };
    },
    joinPath(...args) {
      return path.join(testPath, ...args);
    },
  };

  return result;
}

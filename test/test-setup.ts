import fs from 'node:fs';
import url from 'node:url';
import path from 'node:path';
import { KEEP_TEST_FOLDER } from './constants.js';
import { deleteFolder } from './utils.js';

type CleanupFn = () => void;

interface TestSetup {
  /**
   * Directory path of the temporary test folder
   */
  testPath: string;
  /**
   * Creates a temporary test folder for the provided testName
   * in the test file's directory
   *
   * @returns a cleanup function that deletes the test folder,
   * unless KEEP_TEST_FOLDER environment variable is set to true
   */
  setup: () => CleanupFn;
  /**
   * Joins the provided arg names with the testPath
   */
  joinPath: (...args: string[]) => string;
}

export function testSetup(testName: string, meta: ImportMeta): TestSetup {
  const __dirname = url.fileURLToPath(new URL('.', meta.url));
  const testPath = path.join(__dirname, `__test__${testName}`);

  const result: TestSetup = {
    testPath,
    setup() {
      if (fs.existsSync(testPath)) {
        deleteFolder(testPath);
      }
      fs.mkdirSync(testPath);

      return function cleanup() {
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

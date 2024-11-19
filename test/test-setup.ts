import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { KEEP_TEST_FOLDER } from '@test-utils/constants.js';
import { deleteDir } from '@test-utils/delete-dir.js';

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
   * unless deleteTestFolder option is set to false
   * or KEEP_TEST_FOLDER env variable is set to true
   */
  setup: (config?: { deleteTestFolder?: boolean }) => CleanupFn;
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
    setup({ deleteTestFolder } = { deleteTestFolder: true }) {
      if (fs.existsSync(testPath)) {
        deleteDir(testPath);
      }
      fs.mkdirSync(testPath);

      return function cleanup() {
        if (deleteTestFolder && !KEEP_TEST_FOLDER) {
          deleteDir(testPath);
        }
      };
    },
    joinPath(...args) {
      return path.join(testPath, ...args);
    },
  };

  return result;
}

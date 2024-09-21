import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll } from 'vitest';
import { KEEP_TEST_FOLDER, TESTS_ROOT } from './constants.js';
import { deleteFolder } from './utils.js';

interface SuiteRootInterface {
  getTestRoot: (testName: string) => string;
  setup: () => void;
}

export function useTestSuite(suiteName: string): SuiteRootInterface {
  const suiteRoot = path.join(TESTS_ROOT, suiteName);
  return {
    getTestRoot(testName): string {
      return path.join(TESTS_ROOT, suiteName, testName);
    },
    setup(): void {
      beforeAll(() => {
        if (!fs.existsSync(suiteRoot)) {
          fs.mkdirSync(suiteRoot);
          console.log(`${suiteName} suite root directory is created`);
        }
      });

      afterAll(() => {
        if (!KEEP_TEST_FOLDER) {
          deleteFolder(suiteRoot);
          console.log(`${suiteName} suite root directory is deleted`);
        }
      });
    },
  };
}

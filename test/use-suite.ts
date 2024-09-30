// TODO: delete this file

import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll } from 'vitest';
import { KEEP_TEST_FOLDER, TESTS_ROOT } from './constants.js';
import { deleteFolder } from './utils.js';
import globalSetup from './global-setup.js';

interface UseSuiteResultInterface {
  getTestRoot: (testName: string) => string;
  setup: () => void;
}

export function useSuite(suiteName: string): UseSuiteResultInterface {
  const suiteRoot = path.join(TESTS_ROOT, suiteName);
  return {
    getTestRoot(testName): string {
      return path.join(TESTS_ROOT, suiteName, testName);
    },
    setup(): void {
      let globalTeardown: (() => void) | undefined;

      beforeAll(() => {
        if (!fs.existsSync(TESTS_ROOT)) {
          globalTeardown = globalSetup();
        }

        deleteFolder(suiteRoot);
        fs.mkdirSync(suiteRoot, { recursive: true });
        console.log(`${suiteName} suite root directory is created`);
      });

      afterAll(() => {
        if (!KEEP_TEST_FOLDER) {
          deleteFolder(suiteRoot);
          console.log(`${suiteName} suite root directory is deleted`);
          globalTeardown?.();
        }
      });
    },
  };
}

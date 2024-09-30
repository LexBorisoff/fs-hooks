import fs from 'node:fs';
import path from 'node:path';
import { KEEP_TEST_FOLDER, TESTS_ROOT } from './constants.js';
import globalSetup from './global-setup.js';
import { deleteFolder } from './utils.js';

export interface HandleTestDirInterface {
  testRoot: string;
  createTestDir: () => void;
  deleteTestDir: () => void;
}

export function handleTestDir(
  dirName: string,
  parentPath?: string,
): HandleTestDirInterface {
  const testRoot = path.join(parentPath ?? TESTS_ROOT, dirName);
  let globalTeardown: (() => void) | undefined;

  return {
    testRoot,
    createTestDir(recursive = false): void {
      if (!parentPath && !fs.existsSync(TESTS_ROOT)) {
        globalTeardown = globalSetup();
      }

      deleteFolder(testRoot);
      fs.mkdirSync(testRoot, { recursive });
      console.log(`${dirName} test directory is created`);
    },
    deleteTestDir(): void {
      if (!KEEP_TEST_FOLDER) {
        deleteFolder(testRoot);
        console.log(`${dirName} test directory is deleted`);
        globalTeardown?.();
      }
    },
  };
}

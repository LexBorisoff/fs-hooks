import url from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll } from 'vitest';

export const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const testsFolder = path.resolve(__dirname, '../__tests__');
export const keepTestFolder: boolean = process.env.KEEP_TEST_FOLDER === 'true';
export function getRoot(dirName: string): string {
  return path.join(testsFolder, dirName);
}

function deleteTestFolder(): void {
  fs.rmSync(testsFolder, {
    force: true,
    recursive: true,
  });
}

export function handleTestFolder(): void {
  beforeAll(() => {
    if (fs.existsSync(testsFolder)) {
      deleteTestFolder();
    }

    fs.mkdirSync(testsFolder, {
      recursive: true,
    });
  });

  afterAll(() => {
    if (!keepTestFolder) {
      deleteTestFolder();
    }
  });
}

export const testRoots = {
  // file manager init
  callingRootMethod: 'calling-root-method',
  callingTreeMethod: 'calling-tree-method',
  createTree: 'create-tree',
  fileOperations: 'file-operations',

  // operations:
  getPath: 'get-path',
  exists: 'exists',
  dirCreate: 'dir-create',
  fileCreate: 'file-create',
};

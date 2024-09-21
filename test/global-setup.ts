import fs from 'node:fs';
import { deleteFolder } from './utils.js';
import { TESTS_ROOT, KEEP_TEST_FOLDER } from './constants.js';

export default function setup(): () => void {
  deleteFolder(TESTS_ROOT);
  fs.mkdirSync(TESTS_ROOT, {
    recursive: true,
  });
  console.log('Test root directory is created');

  return function teardown(): void {
    if (!KEEP_TEST_FOLDER) {
      deleteFolder(TESTS_ROOT);
      console.log('Test root directory is deleted');
    }
  };
}

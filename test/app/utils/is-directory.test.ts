import fs from 'node:fs';
import { expect, suite, describe, it, beforeAll } from 'vitest';
import { isDirectory } from '../../../src/utils/is-directory.js';
import { testSetup } from '../../test-setup.js';
import { Test } from './constants.js';

const { setup, joinPath } = testSetup(Test.IsDirectory, import.meta);

suite('isDirectory Suite', () => {
  beforeAll(() => setup());

  describe('isDirectory function', () => {
    it('should return true for a directory', () => {
      const dirPath = joinPath('dir1');
      fs.mkdirSync(dirPath);
      expect(isDirectory(dirPath)).toBe(true);
    });

    it('should return false for a non-directory', () => {
      const filePath = joinPath('file1');
      fs.writeFileSync(filePath, '');
      expect(isDirectory(filePath)).toBe(false);
    });
  });
});

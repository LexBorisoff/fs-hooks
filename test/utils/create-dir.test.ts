import fs from 'node:fs';
import { expect, beforeAll, suite, describe, it, afterEach } from 'vitest';
import { createDir } from '../../src/utils/create-dir.js';
import { testSetup } from '../test-setup.js';
import { deleteFolder } from '../utils.js';

const { testPath, setup, joinPath } = testSetup('create-dir', import.meta);

suite('createDir Suite', { concurrent: false }, () => {
  beforeAll(() => {
    return setup();
  });

  describe('createDir function', () => {
    afterEach(() => {
      const files = fs.readdirSync(testPath);
      files.forEach((file) => {
        deleteFolder(joinPath(file));
      });
    });

    it('should create a directory', () => {
      const dirPath = joinPath('dir1');
      expect(fs.existsSync(dirPath)).toBe(false);
      createDir(dirPath);
      expect(fs.existsSync(dirPath)).toBe(true);
    });

    it('should create a nested directory', () => {
      const dirPath = joinPath('dir1', 'dir2');
      expect(fs.existsSync(dirPath)).toBe(false);
      createDir(dirPath, true);
      expect(fs.existsSync(dirPath)).toBe(true);
    });

    it('should throw when recursive flag is false for creating a nested directory', () => {
      expect(() => {
        const dirPath = joinPath('dir1', 'dir2');
        createDir(dirPath, false);
      }).toThrow();
    });

    it('should throw when creating a directory at an existing file path', () => {
      expect(() => {
        const dirPath = joinPath('file1');
        fs.writeFileSync(dirPath, '');
        createDir(dirPath);
      }).toThrow();
    });
  });
});

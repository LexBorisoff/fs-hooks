import fs from 'node:fs';
import { beforeAll, beforeEach, expect, it, suite } from 'vitest';
import { testSetup } from '@test-setup';
import { deleteDir } from '@test-utils/delete-dir.js';
import { Test } from './test.enum.js';

const { setup, joinPath } = testSetup(Test.DeleteDir, import.meta);

suite('deleteDir function', () => {
  beforeAll(() => setup());

  const dirName = 'new-dir';
  const dirPath = joinPath(dirName);

  beforeEach(() => {
    fs.mkdirSync(dirPath);

    return () => {
      fs.rmSync(dirPath, {
        force: true,
        recursive: true,
      });
    };
  });

  it('should delete a directory', () => {
    expect(fs.existsSync(dirPath)).toBe(true);
    deleteDir(dirPath);
    expect(fs.existsSync(dirPath)).toBe(false);
  });

  it('should delete a directory with files', () => {
    const file1 = joinPath(dirName, 'file1');
    const dir1 = joinPath(dirName, 'dir1');
    fs.writeFileSync(file1, '');
    fs.mkdirSync(dir1);

    [dirPath, file1, dir1].forEach((p) => {
      expect(fs.existsSync(p)).toBe(true);
    });

    deleteDir(dirPath);
    [dirPath, file1, dir1].forEach((p) => {
      expect(fs.existsSync(p)).toBe(false);
    });
  });

  it('should delete a directory with nested directories', () => {
    const dir1 = joinPath(dirName, 'dir1');
    const dir2 = joinPath(dirName, 'dir1', 'dir2');

    const file1 = joinPath(dirName, 'dir1', 'file1');
    const file2 = joinPath(dirName, 'dir1', 'dir2', 'file2');

    fs.mkdirSync(dir1);
    fs.mkdirSync(dir2);
    fs.writeFileSync(file1, '');
    fs.writeFileSync(file2, '');

    [dirPath, dir1, dir2, file1, file2].forEach((p) => {
      expect(fs.existsSync(p)).toBe(true);
    });

    deleteDir(dirPath);
    [dirPath, dir1, dir2, file1, file2].forEach((p) => {
      expect(fs.existsSync(p)).toBe(false);
    });
  });
});

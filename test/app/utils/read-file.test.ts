import fs from 'node:fs';
import { beforeAll, beforeEach, expect, it, suite } from 'vitest';
import { readFile } from '@app/utils/read-file.js';
import { testSetup } from '@test-setup';
import { fileDataArray } from '@test-utils/file-data-array.js';

import { TestEnum } from './test.enum.js';

const { setup, joinPath } = testSetup(TestEnum.ReadFile, import.meta);

suite('readFile function', { concurrent: false }, () => {
  beforeAll(() => setup());
  let filePath: string;

  beforeEach(() => {
    const dirName = 'new-dir';
    const dirPath = joinPath(dirName);
    fs.mkdirSync(dirPath);
    filePath = joinPath(dirName, 'new-file');

    return () => {
      fs.rmSync(dirPath, {
        force: true,
        recursive: true,
      });
    };
  });

  it('should read a file', () => {
    fileDataArray.forEach((fileData) => {
      fs.writeFileSync(filePath, fileData);
      expect(readFile(filePath)).toBe(fileData);
    });
  });

  it('should return null if file path does not exist', () => {
    expect(readFile(filePath)).toBe(null);
  });

  it('should return null if attemping to read a directory path', () => {
    fs.mkdirSync(filePath);
    expect(readFile(filePath)).toBe(null);
  });
});

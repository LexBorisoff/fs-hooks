import fs from 'node:fs';

import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';

import { FsHooks } from '@app/fs-hooks.js';
import { testSetup } from '@test-setup';
import { coreHooksObject } from '@test-utils/core-hooks-object.js';
import { deleteDir } from '@test-utils/delete-dir.js';
import { fileDataArray } from '@test-utils/file-data-array.js';
import { tree } from '@test-utils/tree.js';
import { getUseFiles, type UseFilesFn } from '@test-utils/use-files.js';

import { TestEnum } from './test.enum.js';

import type { TreeInterface } from '@app-types/tree.types.js';

const { setup, joinPath } = testSetup(TestEnum.CoreFileHooks, import.meta);

enum CoreFileHOoksTest {
  ObjectProperties = 'object-properties',
  GetPath = 'get-path',
  Exists = 'exists',
  Read = 'read',
  Write = 'write',
  Clear = 'clear',
}

suite('core file hooks', { concurrent: false }, () => {
  beforeAll(() => setup());

  let fsHooks: FsHooks<TreeInterface>;
  let useFiles: UseFilesFn;
  let getDescribePath: (...args: string[]) => string;

  function describeSetup(testName: string): void {
    beforeEach(() => {
      getDescribePath = (...args) => joinPath(testName, ...args);
      const testPath = getDescribePath();
      fsHooks = new FsHooks(testPath, tree);
      useFiles = getUseFiles(fsHooks);

      fs.mkdirSync(testPath);
      return (): void => {
        deleteDir(testPath);
      };
    });
  }

  describe('core file hook properties', () => {
    describeSetup(CoreFileHOoksTest.ObjectProperties);

    it('should have core file hooks', () => {
      useFiles((file) => {
        expect(file).toEqual(coreHooksObject.file);
      });
    });
  });

  describe('getPath core file hook', () => {
    describeSetup(CoreFileHOoksTest.GetPath);

    it('should return file path', () => {
      useFiles((hooks, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        expect(hooks.getPath()).toBe(filePath);
      });
    });
  });

  describe('read core file hook', () => {
    describeSetup(CoreFileHOoksTest.Read);

    it('should read file data', () => {
      useFiles((hooks, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);
        fs.mkdirSync(dirPath, { recursive: true });

        fileDataArray.forEach((fileData) => {
          fs.writeFileSync(filePath, fileData);
          expect(hooks.read()).toBe(fileData);
        });
      });
    });
  });

  describe('write core file hook', () => {
    describeSetup(CoreFileHOoksTest.Write);

    it('should write data to the file', () => {
      useFiles((hooks, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);

        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(filePath, '');

        fileDataArray.forEach((fileData) => {
          hooks.write(fileData);
          const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
          expect(data).toBe(fileData);
        });
      });
    });
  });

  describe('clear core file hook', () => {
    describeSetup(CoreFileHOoksTest.Clear);

    it('should clear file data', () => {
      useFiles((hooks, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);
        fs.mkdirSync(dirPath, { recursive: true });

        fileDataArray.forEach((fileData) => {
          fs.writeFileSync(filePath, fileData);
          hooks.clear();
          const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
          expect(data).toBe('');
        });
      });
    });
  });
});

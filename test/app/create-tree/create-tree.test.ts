import fs from 'node:fs';
import path from 'node:path';

import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  suite,
} from 'vitest';

import { createTree } from '@app/create-tree/create-tree.js';
import { CreateFileError } from '@app/errors/create-file.error.js';
import { FsHooks } from '@app/fs-hooks.js';
import { testSetup } from '@test-setup';
import { deleteDir } from '@test-utils/delete-dir.js';
import { getPathArray, type PathTreeFile } from '@test-utils/get-path-array.js';
import { tree } from '@test-utils/tree.js';

import type { TreeInterface } from '@app-types/tree.types.js';

const { setup, joinPath } = testSetup('create-files', import.meta);

enum CreateFilesTest {
  FsHooksObject = 'fs-hooks-object',
  ErrorHandling = 'error-handling',
}

suite('createTree function', { concurrent: false }, () => {
  beforeAll(() => setup());

  let getDescribePath: (...args: string[]) => string;

  function describeSetup(testName: string): void {
    getDescribePath = (...args) => joinPath(testName, ...args);
  }

  describe('create files based on an operations object', () => {
    describeSetup(CreateFilesTest.FsHooksObject);
    const describePath = getDescribePath();
    const pathArray = getPathArray(describePath, tree);

    beforeEach(() => {
      const fsHooks = new FsHooks(describePath, tree);
      createTree(fsHooks);
    });

    afterEach(() => {
      const files = fs.readdirSync(describePath);
      files.forEach((file) => {
        const currentPath = getDescribePath(file);
        deleteDir(currentPath);
      });
    });

    it('should create files and directories', () => {
      pathArray.forEach((item) => {
        expect(fs.existsSync(item.path)).toBe(true);
      });
    });

    it('should be directories', () => {
      pathArray
        .filter(({ type }) => type === 'dir')
        .forEach((dir) => {
          expect(fs.statSync(dir.path).isDirectory()).toBe(true);
        });
    });

    it('should be files', () => {
      pathArray
        .filter(({ type }) => type === 'file')
        .forEach((file) => {
          expect(fs.statSync(file.path).isFile()).toBe(true);
        });
    });

    it('should write correct file data', () => {
      pathArray
        .filter((item): item is PathTreeFile => item.type === 'file')
        .forEach((file) => {
          const data = fs.readFileSync(file.path, { encoding: 'utf-8' });
          expect(data).toBe(file.data);
        });
    });
  });

  describe('create files error handling', () => {
    describeSetup(CreateFilesTest.ErrorHandling);
    const describePath = getDescribePath();
    const rootPath = getDescribePath('root-path');
    let fsHooks: FsHooks<TreeInterface>;

    beforeEach(() => {
      fsHooks = new FsHooks(rootPath, tree);
      fs.mkdirSync(describePath, { recursive: true });
    });

    afterEach(() => {
      const files = fs.readdirSync(describePath);
      files.forEach((file) => {
        deleteDir(getDescribePath(file));
      });
    });

    it('should return error when root directory path is a file', () => {
      fs.writeFileSync(rootPath, '');

      const errors = createTree(fsHooks);
      expect(errors.length).toBe(1);
      expect(errors.at(0)).toBeInstanceOf(CreateFileError);
      expect(errors.at(0)?.type).toBe('dir');
      expect(errors.at(0)?.path).toBe(rootPath);
    });

    it('should return errors when file paths exist as directories', () => {
      const filePaths: string[] = [];

      function traverse(dir: TreeInterface, dirPath: string): void {
        Object.entries(dir).forEach(([key, value]) => {
          const currentPath = path.resolve(dirPath, key);

          if (typeof value === 'string') {
            filePaths.push(currentPath);
            fs.mkdirSync(currentPath, { recursive: true });
            return;
          }

          if (typeof value === 'object') {
            traverse(value, currentPath);
          }
        });
      }

      traverse(fsHooks.tree, fsHooks.rootPath);

      const errors = createTree(fsHooks);

      expect(errors.length).toBe(filePaths.length);
      filePaths.forEach((filePath, i) => {
        expect(errors.at(i)).toBeInstanceOf(CreateFileError);
        expect(errors.at(i)?.type).toBe('file');
        expect(errors.at(i)?.path).toBe(filePath);
      });
    });

    it('should return errors when directory paths exist as files', () => {
      const dirPaths: string[] = [];

      function traverse(dir: TreeInterface, dirPath: string): void {
        fs.mkdirSync(dirPath, { recursive: true });

        Object.entries(dir).forEach(([key, value]) => {
          if (typeof value === 'object') {
            const currentPath = path.resolve(dirPath, key);
            dirPaths.push(currentPath);
            fs.writeFileSync(currentPath, '');
          }
        });
      }

      traverse(fsHooks.tree, fsHooks.rootPath);

      const errors = createTree(fsHooks);

      expect(errors.length).toBe(dirPaths.length);
      dirPaths.forEach((dirPath, i) => {
        expect(errors.at(i)).toBeInstanceOf(CreateFileError);
        expect(errors.at(i)?.type).toBe('dir');
        expect(errors.at(i)?.path).toBe(dirPath);
      });
    });
  });
});

import fs from 'node:fs';

import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';

import { FsHooks } from '@app/fs-hooks.js';
import { testSetup } from '@test-setup';
import { coreHooksObject } from '@test-utils/core-hooks-object.js';
import { deleteDir } from '@test-utils/delete-dir.js';
import { fileDataArray } from '@test-utils/file-data-array.js';
import { tree } from '@test-utils/tree.js';
import { getUseDirs, type UseDirsFn } from '@test-utils/use-dirs.js';

import { TestEnum } from './test.enum.js';

const { setup, joinPath } = testSetup(TestEnum.CoreDirHooks, import.meta);

enum CoreDirHooksTest {
  ObjectProperties = 'object-properties',
  GetPath = 'get-path',
  Exists = 'exists',
  DirCreate = 'dir-create',
  DirDelete = 'dir-delete',
  FileCreate = 'file-create',
  FileDelete = 'file-delete',
  FileRead = 'file-read',
  FileWrite = 'file-write',
  FileClear = 'file-clear',
}

suite('core directory hooks', { concurrent: false }, () => {
  beforeAll(() => setup());

  let fsHooks: FsHooks<typeof tree>;
  let useDirs: UseDirsFn;
  let getDescribePath: (...args: string[]) => string;

  function describeSetup(testName: string): void {
    beforeEach(() => {
      getDescribePath = (...args) => joinPath(testName, ...args);
      const testPath = getDescribePath();
      fsHooks = new FsHooks(testPath, tree);
      useDirs = getUseDirs(fsHooks);

      fs.mkdirSync(testPath);
      return (): void => {
        deleteDir(testPath);
      };
    });
  }

  describe('core directory hook properties', () => {
    describeSetup(CoreDirHooksTest.ObjectProperties);

    it('should have core directory hooks', () => {
      useDirs((hooks) => {
        expect(hooks).toEqual(coreHooksObject.dir);
      });
    });
  });

  describe('getPath core directory hook', () => {
    describeSetup(CoreDirHooksTest.GetPath);

    it('should return directory path', () => {
      useDirs((hooks, { pathDirs }) => {
        const result = hooks.getPath();
        expect(result).toBe(getDescribePath(...pathDirs));
      });
    });
  });

  describe('exists core directory hook', () => {
    describeSetup(CoreDirHooksTest.Exists);

    it('should check if files and directories exist', () => {
      const dirName = 'new-dir';
      const fileName = 'new-file';

      useDirs((hooks, { pathDirs }) => {
        expect(hooks.exists(dirName)).toBe(false);
        expect(hooks.exists(fileName)).toBe(false);

        const dirPath = getDescribePath(...pathDirs, dirName);
        const filePath = getDescribePath(...pathDirs, fileName);
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(filePath, '');

        expect(hooks.exists(dirName)).toBe(true);
        expect(hooks.exists(fileName)).toBe(true);
      });
    });
  });

  describe('dirCreate core directory hook', () => {
    describeSetup(CoreDirHooksTest.DirCreate);

    it('should create directories', () => {
      const dirName = 'new-dir';

      useDirs((hooks, { pathDirs }) => {
        const treeDirPath = getDescribePath(...pathDirs);
        const newDirPath = getDescribePath(...pathDirs, dirName);
        expect(fs.existsSync(newDirPath)).toBe(false);

        if (!fs.existsSync(treeDirPath)) {
          fs.mkdirSync(treeDirPath);
        }

        const createdDir = hooks.dirCreate(dirName);
        expect(fs.existsSync(newDirPath)).toBe(true);
        expect(fs.statSync(newDirPath).isDirectory()).toBe(true);
        expect(createdDir).toEqual(coreHooksObject.dir);
      });
    });

    it('should return directory hooks when creating existing directories', () => {
      const dirName = 'new-dir';

      useDirs((hooks, { pathDirs }) => {
        const newDirPath = getDescribePath(...pathDirs, dirName);

        if (!fs.existsSync(newDirPath)) {
          fs.mkdirSync(newDirPath, { recursive: true });
        }

        const result = hooks.dirCreate(dirName);
        expect(result).toEqual(coreHooksObject.dir);
      });
    });

    it('should return false when creating nested directories without recursive flag', () => {
      const dirName = 'nested-dir/new-dir';
      useDirs((hooks) => {
        const result = hooks.dirCreate(dirName);
        expect(result).toBe(false);
      });
    });

    it('should create directories recursively', () => {
      const dirName = 'nested-dir/new-dir';

      useDirs((hooks, { pathDirs }) => {
        const newDirPath = getDescribePath(...pathDirs, dirName);
        expect(fs.existsSync(newDirPath)).toBe(false);

        const createdDir = hooks.dirCreate(dirName, true);
        expect(fs.existsSync(newDirPath)).toBe(true);
        expect(fs.statSync(newDirPath).isDirectory()).toBe(true);
        expect(createdDir).toEqual(coreHooksObject.dir);
      });
    });
  });

  describe('dirDelete core directory hook', () => {
    describeSetup(CoreDirHooksTest.DirDelete);

    it('should delete directories', () => {
      const dirName = 'new-dir';

      useDirs((hooks, { pathDirs }) => {
        const dirPath = getDescribePath(...pathDirs, dirName);
        fs.mkdirSync(dirPath, { recursive: true });
        expect(fs.existsSync(dirPath)).toBe(true);

        hooks.dirDelete(dirName);
        expect(fs.existsSync(dirPath)).toBe(false);
      });
    });
  });

  describe('fileCreate core directory hook', () => {
    describeSetup(CoreDirHooksTest.FileCreate);

    it('should create files', () => {
      const fileName = 'new-file';

      useDirs((hooks, { pathDirs }) => {
        const dirPath = getDescribePath(...pathDirs);
        const filePath = getDescribePath(...pathDirs, fileName);
        expect(fs.existsSync(filePath)).toBe(false);

        fs.mkdirSync(dirPath, { recursive: true });
        const createdFile = hooks.fileCreate(fileName);

        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.statSync(filePath).isFile()).toBe(true);
        expect(createdFile).toEqual(coreHooksObject.file);
      });
    });

    it('should return file hooks when creating existing files', () => {
      const fileName = 'new-file';

      useDirs((hooks, { pathDirs }) => {
        const dirPath = getDescribePath(...pathDirs);
        const filePath = getDescribePath(...pathDirs, fileName);

        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(filePath, '');

        const createdFile = hooks.fileCreate(fileName);
        expect(createdFile).toEqual(coreHooksObject.file);
      });
    });

    it('should create a nested file in an existing folder', () => {
      const nestedDirs = ['nested-dir1', 'nested-dir2'];
      const nestedFile = nestedDirs.join('/') + '/new-file';

      useDirs((hooks, { pathDirs }) => {
        const nestedFilePath = getDescribePath(...pathDirs, nestedFile);
        const nestedDirPath = getDescribePath(...pathDirs, ...nestedDirs);
        expect(fs.existsSync(nestedFilePath)).toBe(false);

        fs.mkdirSync(nestedDirPath, { recursive: true });
        const createdFile = hooks.fileCreate(nestedFile);

        expect(fs.existsSync(nestedFilePath)).toBe(true);
        expect(fs.statSync(nestedFilePath).isFile()).toBe(true);
        expect(createdFile).toEqual(coreHooksObject.file);
      });
    });

    it('should return false when creating a nested file in a non-existing folder', () => {
      useDirs((hooks) => {
        const result = hooks.fileCreate('nested-dir/new-file');
        expect(result).toBe(false);
      });
    });
  });

  describe('fileDelete core directory hook', () => {
    describeSetup(CoreDirHooksTest.FileDelete);

    it('should delete files', () => {
      const fileName = 'new-file';

      useDirs((hooks, { pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);

        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(filePath, '');
        expect(fs.existsSync(filePath)).toBe(true);

        hooks.fileDelete(fileName);
        expect(fs.existsSync(filePath)).toBe(false);
      });
    });
  });

  describe('fileRead core directory hook', () => {
    describeSetup(CoreDirHooksTest.FileRead);

    it('should read files', () => {
      const fileName = 'new-file';

      useDirs((hooks, { pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);
        fs.mkdirSync(dirPath, { recursive: true });

        fileDataArray.forEach((fileData) => {
          fs.writeFileSync(filePath, fileData);
          expect(hooks.fileRead(fileName)).toBe(fileData);
        });
      });
    });

    it('should return null when reading a non-existent file', () => {
      useDirs((hooks) => {
        expect(hooks.fileRead('non-existent')).toBe(null);
      });
    });
  });

  describe('fileWrite core directory hook', () => {
    describeSetup(CoreDirHooksTest.FileWrite);

    it('should write to files', () => {
      const fileName = 'new-file';

      useDirs((hooks, { pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(filePath, '');

        fileDataArray.forEach((fileData) => {
          hooks.fileWrite(fileName, fileData);
          const data = fs.readFileSync(filePath, 'utf-8');
          expect(data).toBe(fileData);
        });
      });
    });
  });

  describe('fileClear core directory hook', () => {
    describeSetup(CoreDirHooksTest.FileClear);

    it('should clear file data', () => {
      const fileName = 'new-file';

      useDirs((hooks, { pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);
        fs.mkdirSync(dirPath, { recursive: true });

        fileDataArray.forEach((fileData) => {
          fs.writeFileSync(filePath, fileData);
          hooks.fileClear(fileName);
          const data = fs.readFileSync(filePath, 'utf-8');
          expect(data).toBe('');
        });
      });
    });
  });
});

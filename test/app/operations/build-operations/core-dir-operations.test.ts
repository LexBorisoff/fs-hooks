import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperations } from '@app/operations/build-operations.js';
import type { FileTreeInterface, DirOperationsType } from '@app-types';
import { testSetup } from '@test-setup';
import { deleteDir } from '@test-utils/delete-dir.js';
import { fileDataArray } from '@test-utils/file-data-array.js';
import {
  dirOperationsObject,
  fileOperationsObject,
} from '@test-utils/operations-objects.js';
import { tree } from '@test-utils/tree.js';
import { getUseDirs, type UseDirsFn } from '@test-utils/use-dirs.js';
import { Test } from './test.enum.js';

const { setup, joinPath } = testSetup(Test.CoreDirOperations, import.meta);

enum CoreDirOperationsTest {
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

suite(
  'buildOperations - core directory operations',
  { concurrent: false },
  () => {
    beforeAll(() => setup());

    let result: DirOperationsType<FileTreeInterface>;
    let useDirs: UseDirsFn<undefined, undefined>;
    let getDescribePath: (...args: string[]) => string;

    function describeSetup(testName: string): void {
      beforeEach(() => {
        getDescribePath = (...args) => joinPath(testName, ...args);
        const testPath = getDescribePath();
        result = buildOperations(testPath, tree);
        useDirs = getUseDirs<undefined, undefined>(result, getDescribePath);

        fs.mkdirSync(testPath);
        return (): void => {
          deleteDir(testPath);
        };
      });
    }

    describe('directory core operation properties', () => {
      describeSetup(CoreDirOperationsTest.ObjectProperties);

      it('should be defined', () => {
        expect(result).toBeDefined();
      });

      it('should have core directory operations', () => {
        useDirs((dir) => {
          expect(dir).toMatchObject(dirOperationsObject);
        });
      });
    });

    describe('getPath core directory operation', () => {
      describeSetup(CoreDirOperationsTest.GetPath);

      it('should return directory path', () => {
        useDirs((dir, { pathDirs }) => {
          const dirPath = getDescribePath(...pathDirs);
          expect(dir.$getPath()).toBe(dirPath);
        });
      });
    });

    describe('exists core directory operation', () => {
      describeSetup(CoreDirOperationsTest.Exists);

      it('should check if files and directories exist', () => {
        const dirName = 'new-dir';
        const fileName = 'new-file';

        useDirs((dir, { pathDirs }) => {
          expect(dir.$exists(dirName)).toBe(false);
          expect(dir.$exists(fileName)).toBe(false);

          const dirPath = getDescribePath(...pathDirs, dirName);
          const filePath = getDescribePath(...pathDirs, fileName);
          fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(filePath, '');

          expect(dir.$exists(dirName)).toBe(true);
          expect(dir.$exists(fileName)).toBe(true);
        });
      });
    });

    describe('dirCreate core directory operation', () => {
      describeSetup(CoreDirOperationsTest.DirCreate);

      it('should create directories', () => {
        const dirName = 'new-dir';

        useDirs((dir, { pathDirs }) => {
          const dirPath = getDescribePath(...pathDirs, dirName);
          expect(fs.existsSync(dirPath)).toBe(false);

          const createdDir = dir.$dirCreate(dirName);
          expect(fs.existsSync(dirPath)).toBe(true);
          expect(fs.statSync(dirPath).isDirectory()).toBe(true);
          expect(createdDir).toEqual(dirOperationsObject);
          expect(createdDir.$getPath()).toBe(dirPath);
        });
      });
    });

    describe('dirDelete core directory operation', () => {
      describeSetup(CoreDirOperationsTest.DirDelete);

      it('should delete directories', () => {
        const dirName = 'new-dir';

        useDirs((dir, { pathDirs }) => {
          const dirPath = getDescribePath(...pathDirs, dirName);
          fs.mkdirSync(dirPath, { recursive: true });
          expect(fs.existsSync(dirPath)).toBe(true);

          dir.$dirDelete(dirName);
          expect(fs.existsSync(dirPath)).toBe(false);
        });
      });
    });

    describe('fileCreate core directory operation', () => {
      describeSetup(CoreDirOperationsTest.FileCreate);

      it('should create files', () => {
        const fileName = 'new-file';

        useDirs((dir, { pathDirs }) => {
          const filePath = getDescribePath(...pathDirs, fileName);
          const dirPath = getDescribePath(...pathDirs);
          fs.mkdirSync(dirPath, { recursive: true });
          expect(fs.existsSync(filePath)).toBe(false);

          const createdFile = dir.$fileCreate(fileName);
          expect(fs.existsSync(filePath)).toBe(true);
          expect(fs.statSync(filePath).isFile()).toBe(true);
          expect(createdFile).toEqual(fileOperationsObject);
          expect(createdFile.$getPath()).toBe(filePath);
        });
      });

      it('should create a nested file in an existing folder', () => {
        const nestedDirs = ['nested-dir1', 'nested-dir2'];
        const nestedFile = nestedDirs.join('/') + '/new-file';

        useDirs((dir, { pathDirs }) => {
          const nestedFilePath = getDescribePath(...pathDirs, nestedFile);
          const nestedDirPath = getDescribePath(...pathDirs, ...nestedDirs);
          fs.mkdirSync(nestedDirPath, { recursive: true });
          expect(fs.existsSync(nestedFilePath)).toBe(false);

          const createdFile = dir.$fileCreate(nestedFile);
          expect(fs.existsSync(nestedFilePath)).toBe(true);
          expect(fs.statSync(nestedFilePath).isFile()).toBe(true);
          expect(createdFile).toEqual(fileOperationsObject);
          expect(createdFile.$getPath()).toBe(nestedFilePath);
        });
      });

      it('should throw when creating a nested file in a non-existing folder', () => {
        useDirs((dir) => {
          expect(() => dir.$fileCreate('new-dir/new-file')).toThrow();
        });
      });
    });

    describe('fileDelete core directory operation', () => {
      describeSetup(CoreDirOperationsTest.FileDelete);

      it('should delete specified files', () => {
        const fileName = 'new-file';

        useDirs((dir, { pathDirs }) => {
          const filePath = getDescribePath(...pathDirs, fileName);
          const dirPath = getDescribePath(...pathDirs);

          fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(filePath, '');
          expect(fs.existsSync(filePath)).toBe(true);

          dir.$fileDelete(fileName);
          expect(fs.existsSync(filePath)).toBe(false);
        });
      });
    });

    describe('fileRead core directory operation', () => {
      describeSetup(CoreDirOperationsTest.FileRead);

      it('should read files', () => {
        const fileName = 'new-file';

        useDirs((dir, { pathDirs }) => {
          const filePath = getDescribePath(...pathDirs, fileName);
          const dirPath = getDescribePath(...pathDirs);
          fs.mkdirSync(dirPath, { recursive: true });

          fileDataArray.forEach((fileData) => {
            fs.writeFileSync(filePath, fileData);
            expect(dir.$fileRead(fileName)).toBe(fileData);
          });
        });
      });

      it('should return null when reading a non-existent file', () => {
        useDirs((dir) => {
          expect(dir.$fileRead('non-existent')).toBe(null);
        });
      });
    });

    describe('fileWrite core directory operation', () => {
      describeSetup(CoreDirOperationsTest.FileWrite);

      it('should write to specified files', () => {
        const fileName = 'new-file';

        useDirs((dir, { pathDirs }) => {
          const filePath = getDescribePath(...pathDirs, fileName);
          const dirPath = getDescribePath(...pathDirs);
          fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(filePath, '');

          fileDataArray.forEach((fileData) => {
            dir.$fileWrite(fileName, fileData);
            const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
            expect(data).toBe(fileData);
          });
        });
      });
    });

    describe('fileClear core directory operation', () => {
      describeSetup(CoreDirOperationsTest.FileClear);

      it('should clear data for specified files', () => {
        const fileName = 'new-file';

        useDirs((dir, { pathDirs }) => {
          const filePath = getDescribePath(...pathDirs, fileName);
          const dirPath = getDescribePath(...pathDirs);
          fs.mkdirSync(dirPath, { recursive: true });

          fileDataArray.forEach((fileData) => {
            fs.writeFileSync(filePath, fileData);
            dir.$fileClear(fileName);
            const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
            expect(data).toBe('');
          });
        });
      });
    });
  },
);

import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import type {
  DirOperationsInterface,
  FileTreeOperationsType,
} from '../../../src/operations/operation.types.js';
import { buildOperationTree } from '../../../src/operations/build-operation-tree.js';
import { testSetup } from '../../test-setup.js';
import { deleteFolder } from '../../utils.js';
import {
  dirOperationsObject,
  fileOperationsObject,
  fileDataArray,
  Test,
  tree,
  type Tree,
} from './constants.js';

const { setup, joinPath } = testSetup(Test.CoreDirOperations, import.meta);

enum CoreOperations {
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
  'buildOperationTree - core directory operations',
  { concurrent: false },
  () => {
    let result: FileTreeOperationsType<Tree>;

    beforeAll(() => {
      return setup();
    });

    type DirType = DirOperationsInterface<undefined, undefined, undefined>;
    type OperationPathFn = (...args: string[]) => string;

    function describeOperation(testName: string): OperationPathFn {
      function operationPath(...args: string[]): string {
        return joinPath(testName, ...args);
      }

      const testPath = operationPath();

      beforeEach(() => {
        result = buildOperationTree(testPath, tree);
        fs.mkdirSync(testPath);
        return (): void => {
          deleteFolder(testPath);
        };
      });

      return operationPath;
    }

    function useDirs(cb: (dir: DirType, parentDirs: string[]) => void): void {
      interface DirItem {
        dir: DirType;
        parentDirs: string[];
      }

      const dirs: DirItem[] = [
        {
          dir: result,
          parentDirs: [],
        },
        {
          dir: result.dir1,
          parentDirs: ['dir1'],
        },
        {
          dir: result.dir2,
          parentDirs: ['dir2'],
        },
        {
          dir: result.dir2.dir1,
          parentDirs: ['dir2', 'dir1'],
        },
        {
          dir: result.dir2.dir2,
          parentDirs: ['dir2', 'dir2'],
        },
      ];

      const newDirName = 'dirCreate';

      /**
       * Types of directories for testing
       * 1. from the file tree
       * 2. created with $dirCreate
       */
      dirs.forEach(({ dir, parentDirs }) => {
        cb(dir, parentDirs);
        cb(dir.$dirCreate(newDirName), parentDirs.concat(newDirName));
      });
    }

    describe('getPath on directory objects', () => {
      const operationPath = describeOperation(CoreOperations.GetPath);

      it('should return directory path', () => {
        useDirs((dir, parentDirs) => {
          const dirPath = operationPath(...parentDirs);
          expect(dir.$getPath()).toBe(dirPath);
        });
      });
    });

    describe('exists on directory objects', () => {
      const operationPath = describeOperation(CoreOperations.Exists);

      it('should check if files and directories exist', () => {
        const dirName = 'new-dir';
        const fileName = 'new-file';

        useDirs((dir, parentDirs) => {
          expect(dir.$exists(dirName)).toBe(false);
          expect(dir.$exists(fileName)).toBe(false);

          const dirPath = operationPath(...parentDirs, dirName);
          const filePath = operationPath(...parentDirs, fileName);
          fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(filePath, '');

          expect(dir.$exists(dirName)).toBe(true);
          expect(dir.$exists(fileName)).toBe(true);
        });
      });
    });

    describe('dirCreate', () => {
      const operationPath = describeOperation(CoreOperations.DirCreate);

      it('should create directories', () => {
        const dirName = 'new-dir';

        useDirs((dir, parentDirs) => {
          const dirPath = operationPath(...parentDirs, dirName);
          expect(fs.existsSync(dirPath)).toBe(false);

          const createdDir = dir.$dirCreate(dirName);
          expect(fs.existsSync(dirPath)).toBe(true);
          expect(fs.statSync(dirPath).isDirectory()).toBe(true);
          expect(createdDir).toEqual(dirOperationsObject);
          expect(createdDir.$getPath()).toBe(dirPath);
        });
      });
    });

    describe('dirDelete', () => {
      const operationPath = describeOperation(CoreOperations.DirDelete);

      it('should delete directories', () => {
        const dirName = 'new-dir';

        useDirs((dir, parentDirs) => {
          const dirPath = operationPath(...parentDirs, dirName);
          fs.mkdirSync(dirPath, { recursive: true });
          expect(fs.existsSync(dirPath)).toBe(true);

          dir.$dirDelete(dirName);
          expect(fs.existsSync(dirPath)).toBe(false);
        });
      });
    });

    describe('fileCreate', () => {
      const operationPath = describeOperation(CoreOperations.FileCreate);

      it('should create files', () => {
        const fileName = 'new-file';

        useDirs((dir, parentDirs) => {
          const filePath = operationPath(...parentDirs, fileName);
          const dirPath = operationPath(...parentDirs);
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

        useDirs((dir, parentDirs) => {
          const nestedFilePath = operationPath(...parentDirs, nestedFile);
          const nestedDirPath = operationPath(...parentDirs, ...nestedDirs);
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

    describe('fileDelete', () => {
      const operationPath = describeOperation(CoreOperations.FileDelete);

      it('should delete specified files', () => {
        const fileName = 'new-file';

        useDirs((dir, parentDirs) => {
          const filePath = operationPath(...parentDirs, fileName);
          const dirPath = operationPath(...parentDirs);

          fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(filePath, '');
          expect(fs.existsSync(filePath)).toBe(true);

          dir.$fileDelete(fileName);
          expect(fs.existsSync(filePath)).toBe(false);
        });
      });
    });

    describe('fileRead', () => {
      const operationPath = describeOperation(CoreOperations.FileRead);

      it('should read files', () => {
        const fileName = 'new-file';

        useDirs((dir, parentDirs) => {
          const filePath = operationPath(...parentDirs, fileName);
          const dirPath = operationPath(...parentDirs);
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

    describe('fileWrite', () => {
      const operationPath = describeOperation(CoreOperations.FileWrite);

      it('should write to specified files', () => {
        const fileName = 'new-file';

        useDirs((dir, parentDirs) => {
          const filePath = operationPath(...parentDirs, fileName);
          const dirPath = operationPath(...parentDirs);
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

    describe('fileClear', () => {
      const operationPath = describeOperation(CoreOperations.FileClear);

      it('should clear data for specified files', () => {
        const fileName = 'new-file';

        useDirs((dir, parentDirs) => {
          const filePath = operationPath(...parentDirs, fileName);
          const dirPath = operationPath(...parentDirs);
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

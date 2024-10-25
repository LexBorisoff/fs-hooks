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

    function useDirs(
      testName: string,
      cb: (dir: DirType, parentDirs: string[]) => void,
    ): void {
      interface DirInfo {
        dir: DirType;
        parentDirs: string[];
      }

      const dirs: DirInfo[] = [
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

      const dirName = 'dirCreate';

      /**
       * Types of directories for testing
       * 1. from the file tree
       * 2. created with $dirCreate
       */
      dirs.forEach(({ dir, parentDirs }) => {
        const dirPath = joinPath(testName, ...parentDirs);
        fs.mkdirSync(dirPath, { recursive: true });

        cb(dir, parentDirs);
        cb(dir.$dirCreate(dirName), parentDirs.concat(dirName));
      });
    }

    describe('directory operations properties', () => {
      const testName = CoreOperations.ObjectProperties;
      describeOperation(testName);

      it('should be defined', () => {
        expect(result).toBeDefined();
      });

      it('should have core directory operations', () => {
        useDirs(testName, (dir) => {
          expect(dir).toMatchObject(dirOperationsObject);
        });
      });
    });

    describe('getPath on directory objects', () => {
      const testName = CoreOperations.GetPath;
      const operationPath = describeOperation(testName);

      it('should return directory path', () => {
        useDirs(testName, (dir, parentDirs) => {
          const dirPath = operationPath(...parentDirs);
          expect(dir.$getPath()).toBe(dirPath);
        });
      });
    });

    describe('exists on directory objects', () => {
      const testName = CoreOperations.Exists;
      const operationPath = describeOperation(testName);

      it('should check if files and directories exist', () => {
        const dirName = 'new-dir';
        const fileName = 'new-file';

        useDirs(testName, (dir, parentDirs) => {
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
      const testName = CoreOperations.DirCreate;
      const operationPath = describeOperation(testName);

      it('should create directories', () => {
        const dirName = 'new-dir';

        useDirs(testName, (dir, parentDirs) => {
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
      const testName = CoreOperations.DirDelete;
      const operationPath = describeOperation(testName);

      it('should delete directories', () => {
        const dirName = 'new-dir';

        useDirs(testName, (dir, parentDirs) => {
          const dirPath = operationPath(...parentDirs, dirName);
          fs.mkdirSync(dirPath, { recursive: true });
          expect(fs.existsSync(dirPath)).toBe(true);

          dir.$dirDelete(dirName);
          expect(fs.existsSync(dirPath)).toBe(false);
        });
      });
    });

    describe('fileCreate', () => {
      const testName = CoreOperations.FileCreate;
      const operationPath = describeOperation(testName);

      it('should create files', () => {
        const fileName = 'new-file';

        useDirs(testName, (dir, parentDirs) => {
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

        useDirs(testName, (dir, parentDirs) => {
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
        useDirs(testName, (dir) => {
          expect(() => dir.$fileCreate('new-dir/new-file')).toThrow();
        });
      });
    });

    describe('fileDelete', () => {
      const testName = CoreOperations.FileDelete;
      const operationPath = describeOperation(testName);

      it('should delete specified files', () => {
        const fileName = 'new-file';

        useDirs(testName, (dir, parentDirs) => {
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
      const testName = CoreOperations.FileRead;
      const operationPath = describeOperation(testName);

      it('should read files', () => {
        const fileName = 'new-file';

        useDirs(testName, (dir, parentDirs) => {
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
        useDirs(testName, (dir) => {
          expect(dir.$fileRead('non-existent')).toBe(null);
        });
      });
    });

    describe('fileWrite', () => {
      const testName = CoreOperations.FileWrite;
      const operationPath = describeOperation(testName);

      it('should write to specified files', () => {
        const fileName = 'new-file';

        useDirs(testName, (dir, parentDirs) => {
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
      const testName = CoreOperations.FileClear;
      const operationPath = describeOperation(testName);

      it('should clear data for specified files', () => {
        const fileName = 'new-file';

        useDirs(testName, (dir, parentDirs) => {
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

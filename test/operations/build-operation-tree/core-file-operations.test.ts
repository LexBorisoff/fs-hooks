import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import type {
  DirOperationsInterface,
  FileOperationsInterface,
  RootOperationTreeType,
} from '../../../src/operations/operation.types.js';
import { buildOperationTree } from '../../../src/operations/build-operation-tree.js';
import { testSetup } from '../../test-setup.js';
import { deleteFolder } from '../../utils.js';
import type { FileTreeInterface } from '../../../src/file-tree/file-tree.types.js';
import {
  fileDataArray,
  fileOperationsObject,
  Test,
  tree,
  type Tree,
} from './constants.js';

const { setup, joinPath } = testSetup(Test.CoreFileOperations, import.meta);

enum CoreOperations {
  ObjectProperties = 'object-properties',
  GetPath = 'get-path',
  Exists = 'exists',
  Read = 'read',
  Write = 'write',
  Clear = 'clear',
}

suite(
  'buildOperationTree - core file operations',
  { concurrent: false },
  () => {
    let result: RootOperationTreeType<Tree>;

    beforeAll(() => {
      return setup();
    });

    type FileType = FileOperationsInterface;
    type DirType = DirOperationsInterface<
      FileTreeInterface,
      undefined,
      undefined
    >;
    type GetDescribePathFn = (...args: string[]) => string;

    function describeTest(testName: string): GetDescribePathFn {
      function getDescribePath(...args: string[]): string {
        return joinPath(testName, ...args);
      }

      const testPath = getDescribePath();

      beforeEach(() => {
        result = buildOperationTree(testPath, tree);
        fs.mkdirSync(testPath);
        return (): void => {
          deleteFolder(testPath);
        };
      });

      return getDescribePath;
    }

    function useFiles(
      testName: string,
      cb: (info: {
        file: FileType;
        fileName: string;
        parentDirs: string[];
      }) => void,
    ): void {
      interface FileInfo {
        fileName: string;
        file: FileType;
        dir: DirType;
        parentDirs: string[];
      }

      const files: FileInfo[] = [
        {
          fileName: 'file1',
          file: result.file1,
          dir: result,
          parentDirs: [],
        },
        {
          fileName: 'file2',
          file: result.file2,
          dir: result,
          parentDirs: [],
        },
        {
          fileName: 'file1',
          file: result.dir2.file1,
          dir: result.dir2,
          parentDirs: ['dir2'],
        },
        {
          fileName: 'file2',
          file: result.dir2.file2,
          dir: result.dir2,
          parentDirs: ['dir2'],
        },
        {
          fileName: 'file1',
          file: result.dir2.dir2.file1,
          dir: result.dir2.dir2,
          parentDirs: ['dir2', 'dir2'],
        },
        {
          fileName: 'file2',
          file: result.dir2.dir2.file2,
          dir: result.dir2.dir2,
          parentDirs: ['dir2', 'dir2'],
        },
      ];

      /**
       * Test files from the file tree
       */
      files.forEach(({ file, fileName, parentDirs }) => {
        const dirPath = joinPath(testName, ...parentDirs);
        fs.mkdirSync(dirPath, { recursive: true });
        cb({ file, fileName, parentDirs });
      });

      const dirName = 'dirCreate';
      const fileName = 'fileCreate';

      /**
       * Types of files for testing
       * 1. created with $fileCreate on directories from the file tree
       * 2. created with $dirCreate + $fileCreate combination
       */
      files.forEach(({ dir, parentDirs }) => {
        // 1. created with $fileCreate on a directory from the file tree
        let file = dir.$fileCreate(fileName);
        cb({ file, fileName, parentDirs });

        // 2. created with $dirCreate + $fileCreate combination
        const createdDir = dir.$dirCreate(dirName);
        file = createdDir.$fileCreate(fileName);
        cb({
          file,
          fileName,
          parentDirs: parentDirs.concat(dirName),
        });
      });
    }

    describe('file operations properties', () => {
      const testName = CoreOperations.ObjectProperties;
      describeTest(testName);

      it('should be defined', () => {
        expect(result).toBeDefined();
      });

      it('should have core file operations', () => {
        useFiles(testName, ({ file }) => {
          expect(file).toEqual(fileOperationsObject);
        });
      });
    });

    describe('getPath on file objects', () => {
      const testName = CoreOperations.GetPath;
      const getDescribePath = describeTest(testName);

      it('should return file path', () => {
        useFiles(testName, ({ file, fileName, parentDirs }) => {
          const filePath = getDescribePath(...parentDirs, fileName);
          const f = file instanceof Function ? file() : file;
          expect(f.$getPath()).toBe(filePath);
        });
      });
    });

    describe('read', () => {
      const testName = CoreOperations.Read;
      const getDescribePath = describeTest(testName);

      it('should read file data', () => {
        useFiles(testName, ({ file, fileName, parentDirs }) => {
          const filePath = getDescribePath(...parentDirs, fileName);
          const dirPath = getDescribePath(...parentDirs);
          fs.mkdirSync(dirPath, { recursive: true });

          fileDataArray.forEach((fileData) => {
            fs.writeFileSync(filePath, fileData);
            expect(file.$read()).toBe(fileData);
          });
        });
      });
    });

    describe('write', () => {
      const testName = CoreOperations.Write;
      const getDescribePath = describeTest(testName);

      it('should write data to the file', () => {
        useFiles(testName, ({ file, fileName, parentDirs }) => {
          const filePath = getDescribePath(...parentDirs, fileName);
          const dirPath = getDescribePath(...parentDirs);
          fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(filePath, '');

          fileDataArray.forEach((fileData) => {
            file.$write(fileData);
            const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
            expect(data).toBe(fileData);
          });
        });
      });
    });

    describe('clear', () => {
      const testName = CoreOperations.Clear;
      const getDescribePath = describeTest(testName);

      it('should clear file data', () => {
        useFiles(testName, ({ file, fileName, parentDirs }) => {
          const filePath = getDescribePath(...parentDirs, fileName);
          const dirPath = getDescribePath(...parentDirs);
          fs.mkdirSync(dirPath, { recursive: true });

          fileDataArray.forEach((fileData) => {
            fs.writeFileSync(filePath, fileData);
            file.$clear();
            const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
            expect(data).toBe('');
          });
        });
      });
    });
  },
);

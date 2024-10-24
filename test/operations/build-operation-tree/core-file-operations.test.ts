import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import type {
  DirOperationsInterface,
  FileOperationsInterface,
  FileTreeOperationsType,
} from '../../../src/operations/operation.types.js';
import { buildOperationTree } from '../../../src/operations/build-operation-tree.js';
import { testSetup } from '../../test-setup.js';
import { deleteFolder } from '../../utils.js';
import { fileDataArray, Test, tree, type Tree } from './constants.js';

const { setup, joinPath } = testSetup(Test.CoreFileOperations, import.meta);

enum CoreOperations {
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
    let result: FileTreeOperationsType<Tree>;

    beforeAll(() => {
      return setup();
    });

    type FileType = FileOperationsInterface;
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

    function useFiles(
      testName: string,
      cb: (file: FileType, fileName: string, parentDirs: string[]) => void,
    ): void {
      interface FileItem {
        file: FileType;
        dir: DirType;
        fileName: string;
        parentDirs: string[];
      }

      const files: FileItem[] = [
        {
          file: result.file1,
          dir: result,
          fileName: 'file1',
          parentDirs: [],
        },
        {
          file: result.file2,
          dir: result,
          fileName: 'file2',
          parentDirs: [],
        },
        {
          file: result.dir2.file1,
          dir: result.dir2,
          fileName: 'file1',
          parentDirs: ['dir2'],
        },
        {
          file: result.dir2.file2,
          dir: result.dir2,
          fileName: 'file2',
          parentDirs: ['dir2'],
        },
        {
          file: result.dir2.dir2.file1,
          dir: result.dir2.dir2,
          fileName: 'file1',
          parentDirs: ['dir2', 'dir2'],
        },
        {
          file: result.dir2.dir2.file2,
          dir: result.dir2.dir2,
          fileName: 'file2',
          parentDirs: ['dir2', 'dir2'],
        },
      ];

      const newDirName = 'dirCreate';
      const newFileName = 'fileCreate';

      /**
       * Types of files for testing
       * 1. from the file tree
       * 2. created with $fileCreate on directories from the file tree
       * 3. created with $dirCreate + $fileCreate combination
       */
      files.forEach(({ file, dir, fileName, parentDirs }) => {
        const dirPath = joinPath(testName, ...parentDirs);
        fs.mkdirSync(dirPath, { recursive: true });

        // 1. from the tree file
        cb(file, fileName, parentDirs);

        // 2. created with $fileCreate on a directory from the file tree
        let createdFile = dir.$fileCreate(newFileName);
        cb(createdFile, newFileName, parentDirs);

        // 2. created with $dirCreate + $fileCreate combination
        const createdDir = dir.$dirCreate(newDirName);
        createdFile = createdDir.$fileCreate(newFileName);
        cb(createdFile, newFileName, parentDirs.concat(newDirName));
      });
    }

    describe('getPath on file objects', () => {
      const testName = CoreOperations.GetPath;
      const operationPath = describeOperation(testName);

      it('should return file path', () => {
        useFiles(testName, (file, fileName, parentDirs) => {
          const filePath = operationPath(...parentDirs, fileName);
          const f = file instanceof Function ? file() : file;
          expect(f.$getPath()).toBe(filePath);
        });
      });
    });

    describe('read', () => {
      const testName = CoreOperations.Read;
      const operationPath = describeOperation(testName);

      it('should read file data', () => {
        useFiles(testName, (file, fileName, parentDirs) => {
          const filePath = operationPath(...parentDirs, fileName);
          const dirPath = operationPath(...parentDirs);
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
      const operationPath = describeOperation(testName);

      it('should write data to the file', () => {
        useFiles(testName, (file, fileName, parentDirs) => {
          const filePath = operationPath(...parentDirs, fileName);
          const dirPath = operationPath(...parentDirs);
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
      const operationPath = describeOperation(testName);

      it('should clear file data', () => {
        useFiles(testName, (file, fileName, parentDirs) => {
          const filePath = operationPath(...parentDirs, fileName);
          const dirPath = operationPath(...parentDirs);
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

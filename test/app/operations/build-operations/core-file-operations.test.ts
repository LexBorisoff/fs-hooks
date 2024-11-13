import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperations } from '@app/operations/build-operations.js';
import type { FileTreeInterface } from '@app/types/file-tree.types.js';
import type {
  DirOperationsType,
  FileOperationsInterface,
  OperationsRecord,
} from '@app/types/operation.types.js';
import { testSetup } from '@test-setup';
import { deleteDir } from '@test-utils/delete-dir.js';
import { fileDataArray } from '@test-utils/file-data-array.js';
import { getFilesInfo } from '@test-utils/get-files-info.js';
import { fileOperationsObject } from '@test-utils/operations-objects.js';
import { tree } from '@test-utils/tree.js';
import { Test } from './test.enum.js';

const { setup, joinPath } = testSetup(Test.CoreFileOperations, import.meta);

enum CoreOperationsTest {
  ObjectProperties = 'object-properties',
  GetPath = 'get-path',
  Exists = 'exists',
  Read = 'read',
  Write = 'write',
  Clear = 'clear',
}

suite('buildOperations - core file operations', { concurrent: false }, () => {
  beforeAll(() => setup());

  let result: DirOperationsType<FileTreeInterface>;
  let testName: string;
  let getDescribePath: (...args: string[]) => string;

  function describeSetup(test: string): void {
    beforeEach(() => {
      testName = test;
      getDescribePath = (...args) => joinPath(testName, ...args);
      const testPath = getDescribePath();
      result = buildOperations(testPath, tree);

      fs.mkdirSync(testPath);
      return (): void => {
        deleteDir(testPath);
      };
    });
  }

  interface DirMeta {
    fileName: string;
    pathDirs: string[];
  }
  type UseFilesCb = (file: FileOperationsInterface, meta: DirMeta) => void;

  function useFiles(cb: UseFilesCb): void {
    const files = getFilesInfo<undefined, OperationsRecord>(result);

    /**
     * Test files from the file tree
     */
    files.forEach(({ file, fileName, pathDirs }) => {
      const dirPath = joinPath(testName, ...pathDirs);
      fs.mkdirSync(dirPath, { recursive: true });
      cb(file, { fileName, pathDirs });
    });

    const dirName = 'dirCreate';
    const fileName = 'fileCreate';

    /**
     * Types of files for testing
     * 1. created with $fileCreate on directories from the file tree
     * 2. created with $dirCreate + $fileCreate combination
     */
    files.forEach(({ dir, pathDirs }) => {
      // 1. created with $fileCreate on a directory from the file tree
      cb(dir.$fileCreate(fileName), { fileName, pathDirs });

      // 2. created with $dirCreate + $fileCreate combination
      const createdDir = dir.$dirCreate(dirName);
      cb(createdDir.$fileCreate(fileName), {
        fileName,
        pathDirs: pathDirs.concat(dirName),
      });
    });
  }

  describe('file core operation properties', () => {
    describeSetup(CoreOperationsTest.ObjectProperties);

    it('should be defined', () => {
      expect(result).toBeDefined();
    });

    it('should have core file operations', () => {
      useFiles((file) => {
        expect(file).toEqual(fileOperationsObject);
      });
    });
  });

  describe('getPath core file operation', () => {
    describeSetup(CoreOperationsTest.GetPath);

    it('should return file path', () => {
      useFiles((file, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        expect(file.$getPath()).toBe(filePath);
      });
    });
  });

  describe('read core file operation', () => {
    describeSetup(CoreOperationsTest.Read);

    it('should read file data', () => {
      useFiles((file, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);
        fs.mkdirSync(dirPath, { recursive: true });

        fileDataArray.forEach((fileData) => {
          fs.writeFileSync(filePath, fileData);
          expect(file.$read()).toBe(fileData);
        });
      });
    });
  });

  describe('write core file operation', () => {
    describeSetup(CoreOperationsTest.Write);

    it('should write data to the file', () => {
      useFiles((file, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);

        function validate(fileData: string): void {
          const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
          expect(data).toBe(fileData);
        }

        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(filePath, '');

        fileDataArray.forEach((fileData) => {
          file.$write(fileData);
          validate(fileData);

          file.$write(() => fileData);
          validate(fileData);
        });
      });
    });

    it('should write data to the file by accepting a function', () => {
      useFiles((file, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(filePath, '');

        fileDataArray.forEach((fileData) => {
          file.$write(() => fileData);
          const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
          expect(data).toBe(fileData);
        });
      });
    });
  });

  describe('clear core file operation', () => {
    describeSetup(CoreOperationsTest.Clear);

    it('should clear file data', () => {
      useFiles((file, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);
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
});

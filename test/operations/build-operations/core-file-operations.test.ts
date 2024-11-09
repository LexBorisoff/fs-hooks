import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import type {
  DirOperationsType,
  FileOperationsInterface,
} from '../../../src/types/operation.types.js';
import { buildOperations } from '../../../src/operations/build-operations.js';
import { testSetup } from '../../test-setup.js';
import { deleteFolder } from '../../utils.js';
import { tree, type Tree } from '../../tree.js';
import { fileOperationsObject } from '../../operations-objects.js';
import { getFilesInfo } from '../../get-files-info.js';
import { fileDataArray, Test } from './constants.js';

const { setup, joinPath } = testSetup(Test.CoreFileOperations, import.meta);

enum CoreOperations {
  ObjectProperties = 'object-properties',
  GetPath = 'get-path',
  Exists = 'exists',
  Read = 'read',
  Write = 'write',
  Clear = 'clear',
}

suite('buildOperations - core file operations', { concurrent: false }, () => {
  beforeAll(() => {
    return setup();
  });

  let result: DirOperationsType<Tree>;
  let getDescribePath: (...args: string[]) => string;

  function describeTest(testName: string): void {
    beforeEach(() => {
      getDescribePath = (...args) => joinPath(testName, ...args);
      const testPath = getDescribePath();
      result = buildOperations(testPath, tree);

      fs.mkdirSync(testPath);
      return (): void => {
        deleteFolder(testPath);
      };
    });
  }

  interface DirMeta {
    fileName: string;
    pathDirs: string[];
  }
  type UseFilesCb = (file: FileOperationsInterface, meta: DirMeta) => void;

  function useFiles(testName: string, cb: UseFilesCb): void {
    const files = getFilesInfo(result);

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

  describe('file operations properties', () => {
    const testName = CoreOperations.ObjectProperties;
    describeTest(testName);

    it('should be defined', () => {
      expect(result).toBeDefined();
    });

    it('should have core file operations', () => {
      useFiles(testName, (file) => {
        expect(file).toEqual(fileOperationsObject);
      });
    });
  });

  describe('getPath on file objects', () => {
    const testName = CoreOperations.GetPath;
    describeTest(testName);

    it('should return file path', () => {
      useFiles(testName, (file, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const f = file instanceof Function ? file() : file;
        expect(f.$getPath()).toBe(filePath);
      });
    });
  });

  describe('read', () => {
    const testName = CoreOperations.Read;
    describeTest(testName);

    it('should read file data', () => {
      useFiles(testName, (file, { fileName, pathDirs }) => {
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

  describe('write', () => {
    const testName = CoreOperations.Write;
    describeTest(testName);

    it('should write data to the file', () => {
      useFiles(testName, (file, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        const dirPath = getDescribePath(...pathDirs);
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
    describeTest(testName);

    it('should clear file data', () => {
      useFiles(testName, (file, { fileName, pathDirs }) => {
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

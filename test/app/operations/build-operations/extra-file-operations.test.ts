import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperations } from '@app/operations/build-operations.js';
import type {
  FileTreeInterface,
  FileType,
  DirOperationsType,
  FileOperationsType,
} from '@app-types';
import { testSetup } from '@test-setup';
import { deleteDir } from '@test-utils/delete-dir.js';
import {
  extraFileOperations,
  type ExtraFileOperations,
} from '@test-utils/extra-operations.js';
import { fileDataArray } from '@test-utils/file-data-array.js';
import { getFilesInfo } from '@test-utils/get-files-info.js';
import {
  buildOperationsObject,
  fileOperationsObject,
} from '@test-utils/operations-objects.js';
import { tree } from '@test-utils/tree.js';
import { Test } from './test.enum.js';

const { setup, joinPath } = testSetup(Test.ExtraFileOperations, import.meta);

enum ExtraOperationsTest {
  ObjectProperties = 'object-properties',
  GetFilePath = 'get-file-path',
  GetFileData = 'get-file-data',
  GetFileType = 'get-file-type',
  GetFileSkip = 'get-file-skip',
  PlusOne = 'plus-one',
}

suite('buildOperations - extra file operations', { concurrent: false }, () => {
  beforeAll(() => setup());

  const methods: (keyof ExtraFileOperations)[] = [
    'getFileData',
    'getFilePath',
    'plusOne',
  ];
  const extraFileOperationsObject = buildOperationsObject(methods);

  let result: DirOperationsType<
    FileTreeInterface,
    ExtraFileOperations,
    undefined
  >;
  let testName: string;
  let getDescribePath: (...args: string[]) => string;

  function describeSetup(test: string): void {
    beforeEach(() => {
      testName = test;
      getDescribePath = (...args: string[]) => joinPath(testName, ...args);
      const testPath = getDescribePath();
      result = buildOperations(testPath, tree, { file: extraFileOperations });

      fs.mkdirSync(testPath);
      return (): void => {
        deleteDir(testPath);
      };
    });
  }

  interface FileMeta {
    fileName: string;
    fileData: FileType;
    pathDirs: string[];
  }
  type UseTreeFilesCb = (
    file: FileOperationsType<ExtraFileOperations>,
    meta: FileMeta,
  ) => void;

  /**
   * Test files from the file tree
   */
  function useTreeFiles(cb: UseTreeFilesCb): void {
    getFilesInfo(result).forEach(({ file, fileName, treeFile, pathDirs }) => {
      const dirPath = joinPath(testName, ...pathDirs);
      fs.mkdirSync(dirPath, { recursive: true });
      cb(file, { fileName, fileData: treeFile, pathDirs });
    });
  }

  type UseCreatedFilesCb = (
    file: FileOperationsType<ExtraFileOperations>,
    meta: FileMeta,
  ) => void;

  /**
   * Types of files for testing
   * 1. created with $fileCreate on directories from the file tree
   * 2. created with $dirCreate + $fileCreate combination
   */
  function useCreatedFiles(cb: UseCreatedFilesCb): void {
    const dirName = 'dirCreate';
    const fileName = 'fileCreate';

    getFilesInfo(result).forEach(({ dir, pathDirs }) => {
      const dirPath = joinPath(testName, ...pathDirs);
      fs.mkdirSync(dirPath, { recursive: true });

      fileDataArray.forEach((fileData) => {
        // 1. created with $fileCreate on a directory from the file tree
        cb(dir.$fileCreate(fileName, fileData), {
          fileName,
          fileData,
          pathDirs,
        });

        // 2. created with $dirCreate + $fileCreate combination
        const createdDir = dir.$dirCreate(dirName);
        cb(createdDir.$fileCreate(fileName, fileData), {
          fileName,
          fileData,
          pathDirs: pathDirs.concat(dirName),
        });
      });
    });
  }

  describe('extra file operation properties', () => {
    describeSetup(ExtraOperationsTest.ObjectProperties);

    const operationsObject = {
      ...fileOperationsObject,
      ...extraFileOperationsObject,
    };

    it('should be defined', () => {
      expect(result).toBeDefined();
    });

    it('should have extra file operations for tree files', () => {
      useTreeFiles((file) => {
        expect(file).toEqual(operationsObject);
      });
    });

    it('should have extra file operations for created files', () => {
      useCreatedFiles((file) => {
        expect(file).toEqual(operationsObject);
      });
    });
  });

  describe('getFileData extra file operation', () => {
    describeSetup(ExtraOperationsTest.GetFileData);

    it('should return file data for tree files', () => {
      useTreeFiles((file, { fileData }) => {
        expect(file.getFileData()).toBe(fileData);
      });
    });

    it('should return file data for created files', () => {
      useCreatedFiles((file, { fileData }) => {
        expect(file.getFileData()).toBe(fileData);
      });
    });
  });

  describe('getFilePath extra file operation', () => {
    describeSetup(ExtraOperationsTest.GetFilePath);

    it('should return file path for tree files', () => {
      useTreeFiles((file, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        expect(file.getFilePath()).toBe(filePath);
      });
    });

    it('should return file path for created files', () => {
      useCreatedFiles((file, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        expect(file.getFilePath()).toBe(filePath);
      });
    });
  });

  describe('plusOne extra file operation', () => {
    describeSetup(ExtraOperationsTest.PlusOne);

    it('should add 1 for tree files', () => {
      useTreeFiles((file) => {
        expect(file.plusOne(1)).toBe(2);
      });
    });

    it('should add 1 for created files', () => {
      useCreatedFiles((file) => {
        expect(file.plusOne(1)).toBe(2);
      });
    });
  });
});

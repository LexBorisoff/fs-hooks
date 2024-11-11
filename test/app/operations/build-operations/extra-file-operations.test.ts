import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperations } from '../../../../src/operations/build-operations.js';
import type {
  FileTreeInterface,
  FileType,
} from '../../../../src/types/file-tree.types.js';
import type {
  DirOperationsType,
  FileOperationsType,
} from '../../../../src/types/operation.types.js';
import {
  fileOperations,
  type ExtraFileOperations,
} from '../../../extra-operations.js';
import { getFilesInfo } from '../../../get-files-info.js';
import {
  buildOperationsObject,
  fileOperationsObject,
} from '../../../operations-objects.js';
import { testSetup } from '../../../test-setup.js';
import { tree } from '../../../tree.js';
import { deleteFolder } from '../../../utils.js';
import { fileDataArray, Test } from './constants.js';

const { setup, joinPath } = testSetup(Test.ExtraFileOperations, import.meta);

enum ExtraOperations {
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
  let getDescribePath: (...args: string[]) => string;

  function describeTest(testName: string): void {
    beforeEach(() => {
      getDescribePath = (...args: string[]) => joinPath(testName, ...args);
      const testPath = getDescribePath();
      result = buildOperations(testPath, tree, { fileOperations });

      fs.mkdirSync(testPath);
      return (): void => {
        deleteFolder(testPath);
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
  function useTreeFiles(testName: string, cb: UseTreeFilesCb): void {
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
  function useCreatedFiles(testName: string, cb: UseCreatedFilesCb): void {
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
    const testName = ExtraOperations.ObjectProperties;
    describeTest(testName);

    const operationsObject = {
      ...fileOperationsObject,
      ...extraFileOperationsObject,
    };

    it('should be defined', () => {
      expect(result).toBeDefined();
    });

    it('should have extra file operations for tree files', () => {
      useTreeFiles(testName, (file) => {
        expect(file).toEqual(operationsObject);
      });
    });

    it('should have extra file operations for created files', () => {
      useCreatedFiles(testName, (file) => {
        expect(file).toEqual(operationsObject);
      });
    });
  });

  describe('getFileData extra file operation', () => {
    const testName = ExtraOperations.GetFileData;
    describeTest(testName);

    it('should return file data for tree files', () => {
      useTreeFiles(testName, (file, { fileData }) => {
        expect(file.getFileData()).toBe(fileData);
      });
    });

    it('should return file data for created files', () => {
      useCreatedFiles(testName, (file, { fileData }) => {
        expect(file.getFileData()).toBe(fileData);
      });
    });
  });

  describe('getFilePath extra file operation', () => {
    const testName = ExtraOperations.GetFilePath;
    describeTest(testName);

    it('should return file path for tree files', () => {
      useTreeFiles(testName, (file, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        expect(file.getFilePath()).toBe(filePath);
      });
    });

    it('should return file path for created files', () => {
      useCreatedFiles(testName, (file, { fileName, pathDirs }) => {
        const filePath = getDescribePath(...pathDirs, fileName);
        expect(file.getFilePath()).toBe(filePath);
      });
    });
  });

  describe('plusOne extra file operation', () => {
    const testName = ExtraOperations.PlusOne;
    describeTest(testName);

    it('should add 1 for tree files', () => {
      useTreeFiles(testName, (file) => {
        expect(file.plusOne(1)).toBe(2);
      });
    });

    it('should add 1 for created files', () => {
      useCreatedFiles(testName, (file) => {
        expect(file.plusOne(1)).toBe(2);
      });
    });
  });
});

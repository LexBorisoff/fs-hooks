import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperations } from '../../../src/operations/build-operations.js';
import type {
  DirOperationsInterface,
  FileOperationsInterface,
  FileOperationsFn,
  FileTreeOperationsType,
} from '../../../src/operations/operation.types.js';
import type {
  FileTreeInterface,
  TreeFileType,
} from '../../../src/file-tree/file-tree.types.js';
import { testSetup } from '../../test-setup.js';
import { deleteFolder } from '../../utils.js';
import {
  fileDataArray,
  fileOperationsObject,
  Test,
  tree,
  type Tree,
} from './constants.js';

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
  const fileOperations: FileOperationsFn = (file) => ({
    getFileType(): 'file' {
      return file.type;
    },
    getFileData(): string {
      return file.data;
    },
    getFilePath(): string {
      return file.path;
    },
    plusOne(value: number): number {
      return value + 1;
    },
  });

  type ExtraFileOperations = ReturnType<typeof fileOperations>;
  type FileOperations = FileOperationsInterface & ExtraFileOperations;
  type DirType = DirOperationsInterface<FileTreeInterface, ExtraFileOperations>;

  const extraFileOperationsObject = {
    getFileType: expect.any(Function),
    getFileData: expect.any(Function),
    getFilePath: expect.any(Function),
    plusOne: expect.any(Function),
  };

  let result: FileTreeOperationsType<Tree, ExtraFileOperations>;

  beforeAll(() => {
    return setup();
  });

  type GetDescribePathFn = (...args: string[]) => string;

  function describeTest(testName: string): GetDescribePathFn {
    function getDescribePath(...args: string[]): string {
      return joinPath(testName, ...args);
    }

    const testPath = getDescribePath();

    beforeEach(() => {
      result = buildOperations(testPath, tree, { fileOperations });

      fs.mkdirSync(testPath);
      return (): void => {
        deleteFolder(testPath);
      };
    });

    return getDescribePath;
  }

  interface FileInfo {
    file: FileOperations;
    fileName: string;
    treeFile: TreeFileType;
    dir: DirType;
    parentDirs: string[];
  }

  function getFilesInfo(): FileInfo[] {
    return [
      {
        file: result.file1,
        fileName: 'file1',
        treeFile: tree.file1,
        dir: result,
        parentDirs: [],
      },
      {
        file: result.file2,
        fileName: 'file2',
        treeFile: tree.file2,
        dir: result,
        parentDirs: [],
      },
      {
        file: result.dir2.file1,
        fileName: 'file1',
        treeFile: tree.dir2.file1,
        dir: result.dir2,
        parentDirs: ['dir2'],
      },
      {
        file: result.dir2.file2,
        fileName: 'file2',
        treeFile: tree.dir2.file2,
        dir: result.dir2,
        parentDirs: ['dir2'],
      },
      {
        file: result.dir2.dir2.file1,
        fileName: 'file1',
        treeFile: tree.dir2.dir2.file1,
        dir: result.dir2.dir2,
        parentDirs: ['dir2', 'dir2'],
      },
      {
        file: result.dir2.dir2.file2,
        fileName: 'file2',
        treeFile: tree.dir2.dir2.file2,
        dir: result.dir2.dir2,
        parentDirs: ['dir2', 'dir2'],
      },
    ];
  }

  interface CbBaseInfo {
    file: FileOperations;
    fileName: string;
    parentDirs: string[];
  }

  /**
   * Test files from the file tree
   */
  function useTreeFiles(
    testName: string,
    cb: (info: CbBaseInfo & { treeFile: TreeFileType }) => void,
  ): void {
    getFilesInfo().forEach(({ file, fileName, treeFile, parentDirs }) => {
      const dirPath = joinPath(testName, ...parentDirs);
      fs.mkdirSync(dirPath, { recursive: true });
      cb({ file, fileName, treeFile, parentDirs });
    });
  }

  /**
   * Types of files for testing
   * 1. created with $fileCreate on directories from the file tree
   * 2. created with $dirCreate + $fileCreate combination
   */
  function useCreatedFiles(
    testName: string,
    cb: (info: CbBaseInfo & { fileData: string }) => void,
  ): void {
    const dirName = 'dirCreate';
    const fileName = 'fileCreate';

    getFilesInfo().forEach(({ dir, parentDirs }) => {
      const dirPath = joinPath(testName, ...parentDirs);
      fs.mkdirSync(dirPath, { recursive: true });

      fileDataArray.forEach((fileData) => {
        // 1. created with $fileCreate on a directory from the file tree
        let file = dir.$fileCreate(fileName, fileData);
        cb({ file, fileName, fileData, parentDirs });

        // 2. created with $dirCreate + $fileCreate combination
        const createdDir = dir.$dirCreate(dirName);
        file = createdDir.$fileCreate(fileName, fileData);
        cb({
          file,
          fileName,
          fileData,
          parentDirs: parentDirs.concat(dirName),
        });
      });
    });
  }

  describe('extra file operations properties', () => {
    const testName = ExtraOperations.ObjectProperties;
    describeTest(testName);

    const fullFileOperations = {
      ...fileOperationsObject,
      ...extraFileOperationsObject,
    };

    it('should be defined', () => {
      expect(result).toBeDefined();
    });

    it('should have extra file operations for tree files', () => {
      useTreeFiles(testName, ({ file }) => {
        expect(file).toEqual(fullFileOperations);
      });
    });

    it('should have extra file operations for created files', () => {
      useCreatedFiles(testName, ({ file }) => {
        expect(file).toEqual(fullFileOperations);
      });
    });
  });

  describe('getFileType extra operation', () => {
    const testName = ExtraOperations.GetFileType;
    describeTest(testName);

    it('should return file type for tree files', () => {
      useTreeFiles(testName, ({ file }) => {
        expect(file.getFileType()).toBe('file');
      });
    });

    it('should return file type for created files', () => {
      useCreatedFiles(testName, ({ file }) => {
        expect(file.getFileType()).toBe('file');
      });
    });
  });

  describe('getFileData extra operation', () => {
    const testName = ExtraOperations.GetFileData;
    describeTest(testName);

    it('should return file data for tree files', () => {
      useTreeFiles(testName, ({ file, treeFile }) => {
        expect(file.getFileData()).toBe(treeFile);
      });
    });

    it('should return file data for created files', () => {
      useCreatedFiles(testName, ({ file, fileData }) => {
        expect(file.getFileData()).toBe(fileData);
      });
    });
  });

  describe('getFilePath extra operation', () => {
    const testName = ExtraOperations.GetFilePath;
    const getDescribePath = describeTest(testName);

    it('should return file path for tree files', () => {
      useTreeFiles(testName, ({ file, fileName, parentDirs }) => {
        const filePath = getDescribePath(...parentDirs, fileName);
        expect(file.getFilePath()).toBe(filePath);
      });
    });

    it('should return file path for created files', () => {
      useCreatedFiles(testName, ({ file, fileName, parentDirs }) => {
        const filePath = getDescribePath(...parentDirs, fileName);
        expect(file.getFilePath()).toBe(filePath);
      });
    });
  });

  describe('plusOne extra operation', () => {
    const testName = ExtraOperations.PlusOne;
    describeTest(testName);

    it('should add 1 for tree files', () => {
      useTreeFiles(testName, ({ file }) => {
        expect(file.plusOne(1)).toBe(2);
      });
    });

    it('should add 1 for created files', () => {
      useCreatedFiles(testName, ({ file }) => {
        expect(file.plusOne(1)).toBe(2);
      });
    });
  });
});
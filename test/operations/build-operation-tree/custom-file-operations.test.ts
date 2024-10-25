import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperationTree } from '../../../src/operations/build-operation-tree.js';
import type {
  DirOperationsInterface,
  FileOperationsInterface,
  FileTreeOperationsType,
} from '../../../src/operations/operation.types.js';
import type { FileInterface } from '../../../src/file-tree/file-tree.types.js';
import { buildFileOperations } from '../../../src/operations/build-operations.js';
import { testSetup } from '../../test-setup.js';
import { deleteFolder } from '../../utils.js';
import {
  fileDataArray,
  fileOperationsObject,
  Test,
  tree,
  type Tree,
} from './constants.js';

const { setup, joinPath } = testSetup(Test.CustomFileOperations, import.meta);

enum CustomOperations {
  ObjectProperties = 'object-properties',
  GetFilePath = 'get-file-path',
  GetFileData = 'get-file-data',
  GetFileType = 'get-file-type',
  GetFileSkip = 'get-file-skip',
  PlusOne = 'plus-one',
}

suite(
  'buildOperationTree - custom file operations',
  { concurrent: false },
  () => {
    const getFileOperations = buildFileOperations((file) => ({
      getFilePath(): string {
        return file.path;
      },
      getFileData(): string | undefined {
        return file.data instanceof Function ? file.data() : file.data;
      },
      getFileType(): 'file' {
        return file.type;
      },
      getFileSkip(): boolean | undefined {
        return file.skip;
      },
      plusOne(value: number): number {
        return value + 1;
      },
    }));

    type CustomFileOperations = ReturnType<typeof getFileOperations>;
    type FileOperations = FileOperationsInterface & CustomFileOperations;
    type DirType = DirOperationsInterface<
      undefined,
      CustomFileOperations,
      undefined
    >;

    const customFileOperationsObject = {
      getFilePath: expect.any(Function),
      getFileData: expect.any(Function),
      getFileType: expect.any(Function),
      getFileSkip: expect.any(Function),
      plusOne: expect.any(Function),
    };

    let result: FileTreeOperationsType<Tree, CustomFileOperations>;

    beforeAll(() => {
      return setup();
    });

    type OperationPathFn = (...args: string[]) => string;

    function describeOperation(testName: string): OperationPathFn {
      function operationPath(...args: string[]): string {
        return joinPath(testName, ...args);
      }

      const testPath = operationPath();

      beforeEach(() => {
        result = buildOperationTree(testPath, tree, {
          file: getFileOperations,
        });

        fs.mkdirSync(testPath);
        return (): void => {
          deleteFolder(testPath);
        };
      });

      return operationPath;
    }

    interface FileInfo {
      file: FileOperations;
      fileName: string;
      treeFile: FileInterface;
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
          treeFile: tree.dir2.children.file1,
          dir: result.dir2,
          parentDirs: ['dir2'],
        },
        {
          file: result.dir2.file2,
          fileName: 'file2',
          treeFile: tree.dir2.children.file2,
          dir: result.dir2,
          parentDirs: ['dir2'],
        },
        {
          file: result.dir2.dir2.file1,
          fileName: 'file1',
          treeFile: tree.dir2.children.dir2.children.file1,
          dir: result.dir2.dir2,
          parentDirs: ['dir2', 'dir2'],
        },
        {
          file: result.dir2.dir2.file2,
          fileName: 'file2',
          treeFile: tree.dir2.children.dir2.children.file2,
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
      cb: (info: CbBaseInfo & { treeFile: FileInterface }) => void,
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

    describe('custom file operations properties', () => {
      const testName = CustomOperations.ObjectProperties;
      describeOperation(testName);

      const fullFileOperations = {
        ...fileOperationsObject,
        ...customFileOperationsObject,
      };

      it('should be defined', () => {
        expect(result).toBeDefined();
      });

      it('should have custom file operations for tree files', () => {
        useTreeFiles(testName, ({ file }) => {
          expect(file).toEqual(fullFileOperations);
        });
      });

      it('should have custom file operations for created files', () => {
        useCreatedFiles(testName, ({ file }) => {
          expect(file).toEqual(fullFileOperations);
        });
      });
    });

    describe('getFilePath custom operation', () => {
      const testName = CustomOperations.GetFilePath;
      const operationPath = describeOperation(testName);

      it('should custom return file path for tree files', () => {
        useTreeFiles(testName, ({ file, fileName, parentDirs }) => {
          const filePath = operationPath(...parentDirs, fileName);
          expect(file.getFilePath()).toBe(filePath);
        });
      });

      it('should custom return file path for created files', () => {
        useCreatedFiles(testName, ({ file, fileName, parentDirs }) => {
          const filePath = operationPath(...parentDirs, fileName);
          expect(file.getFilePath()).toBe(filePath);
        });
      });
    });

    describe('getFileData custom operation', () => {
      const testName = CustomOperations.GetFileData;
      describeOperation(testName);

      it('should custom return file data for tree files', () => {
        useTreeFiles(testName, ({ file, treeFile: { data } }) => {
          const fileData = data instanceof Function ? data() : data;
          expect(file.getFileData()).toBe(fileData);
        });
      });

      it('should custom return file data for created files', () => {
        useCreatedFiles(testName, ({ file, fileData }) => {
          expect(file.getFileData()).toBe(fileData);
        });
      });
    });

    describe('getFileType custom operation', () => {
      const testName = CustomOperations.GetFileType;
      describeOperation(testName);

      it('should custom return file type for tree files', () => {
        useTreeFiles(testName, ({ file }) => {
          expect(file.getFileType()).toBe('file');
        });
      });

      it('should custom return file type for created files', () => {
        useCreatedFiles(testName, ({ file }) => {
          expect(file.getFileType()).toBe('file');
        });
      });
    });

    describe('getFileSkip custom operation', () => {
      const testName = CustomOperations.GetFileSkip;
      describeOperation(testName);

      it('should custom return skip value for tree files', () => {
        useTreeFiles(testName, ({ file, treeFile: { skip } }) => {
          expect(file.getFileSkip()).toBe(skip);
        });
      });

      it('should custom return skip value for created files', () => {
        useCreatedFiles(testName, ({ file }) => {
          expect(file.getFileSkip()).toBe(false);
        });
      });
    });

    describe('plusOne custom operation', () => {
      const testName = CustomOperations.PlusOne;
      describeOperation(testName);

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
  },
);

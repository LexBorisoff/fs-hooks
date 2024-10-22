import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { buildOperationTree } from '../../../src/operations/build-operation-tree.js';
import type {
  FileOperationsInterface,
  FileTreeOperationsType,
} from '../../../src/operations/operation.types.js';
import { buildFileOperations } from '../../../src/operations/build-operations.js';
import { testSetup } from '../../test-setup.js';
import { deleteFolder } from '../../utils.js';
import { fileOperationsObject, Test, tree, type Tree } from './constants.js';

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
    type UseFileTreeFilesCb = (file: FileOperations) => void;
    interface FileCreateResultsInterface {
      path: string;
      data: string | undefined;
    }
    type UseFileCreateCb = (
      file: FileOperations,
      testResults: FileCreateResultsInterface,
    ) => void;

    function describeOperation(testName: string): {
      operationPath: OperationPathFn;
      useFileTreeFiles: (testCb: UseFileTreeFilesCb) => void;
      useFileCreate: (testCb: UseFileCreateCb) => void;
    } {
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

      /**
       * Tests files from the file tree
       */
      function useFileTreeFiles(testCb: UseFileTreeFilesCb): void {
        const files = [
          result.file1,
          result.file2,
          result.dir2.file1,
          result.dir2.file2,
          result.dir2.dir2.file1,
          result.dir2.dir2.file2,
        ];

        files.forEach((file) => {
          testCb(file);
        });
      }

      /**
       * Tests files created via fileCreate and dirCreate + fileCreate
       */
      function useFileCreate(testCb: UseFileCreateCb): void {
        const dirName = 'new-dir';
        const fileName = 'new-file';

        fs.mkdirSync(joinPath(testName, 'dir1'));
        fs.mkdirSync(joinPath(testName, 'dir2', 'dir1'), { recursive: true });

        const dirs = {
          dir1: result.$dirCreate(dirName),
          dir2: result.dir1.$dirCreate(dirName),
          dir3: result.dir2.dir1.$dirCreate(dirName),
        };

        // TODO: refactor by getting rid of file1, file2 ...
        const fileData1 = 'Hello, World!';
        const fileData2 = 'Hello, World!\nFile 2';
        const files = {
          tree: {
            file1: result.$fileCreate(fileName, fileData1),
            file2: result.dir1.$fileCreate(fileName, fileData2),
            file3: result.dir2.dir1.$fileCreate(fileName),
          },
          dirCreate: {
            file1: dirs.dir1.$fileCreate(fileName, fileData1),
            file2: dirs.dir2.$fileCreate(fileName, fileData2),
            file3: dirs.dir3.$fileCreate(fileName),
          },
        };

        function getFilePath(
          ...fileDirs: string[]
        ): (useDirCreate?: boolean) => string {
          return function (useDirCreate = false) {
            return useDirCreate
              ? joinPath(testName, ...fileDirs, dirName, fileName)
              : joinPath(testName, ...fileDirs, fileName);
          };
        }

        const paths = {
          file1: getFilePath(),
          file2: getFilePath('dir1'),
          file3: getFilePath('dir2', 'dir1'),
        };

        // files created with fileCreate
        testCb(files.tree.file1, { path: paths.file1(), data: fileData1 });
        testCb(files.tree.file2, { path: paths.file2(), data: fileData2 });
        testCb(files.tree.file3, { path: paths.file3(), data: undefined });

        // files created with dirCreate and fileCreate
        testCb(files.dirCreate.file1, {
          path: paths.file1(true),
          data: fileData1,
        });
        testCb(files.dirCreate.file2, {
          path: paths.file2(true),
          data: fileData2,
        });
        testCb(files.dirCreate.file3, {
          path: paths.file3(true),
          data: undefined,
        });
      }

      return {
        operationPath,
        useFileTreeFiles,
        useFileCreate,
      };
    }

    describe('custom file operations properties', () => {
      const { useFileTreeFiles, useFileCreate } = describeOperation(
        CustomOperations.ObjectProperties,
      );

      const fullFileOperations = {
        ...fileOperationsObject,
        ...customFileOperationsObject,
      };

      it('should be defined', () => {
        expect(result).toBeDefined();
      });

      it('should have custom file operations (file tree)', () => {
        useFileTreeFiles((file) => {
          expect(file).toEqual(fullFileOperations);
        });
      });

      it('should have custom file operations (fileCreate)', () => {
        useFileCreate((file) => {
          expect(file).toEqual(fullFileOperations);
        });
      });
    });

    describe('getFilePath custom operation', () => {
      const { operationPath, useFileCreate } = describeOperation(
        CustomOperations.GetFilePath,
      );

      it('should return file path (file tree)', () => {
        interface TestItem {
          filePath: string;
          getFilePath: () => string;
        }

        const files: TestItem[] = [
          {
            filePath: operationPath('file1'),
            getFilePath: () => result.file1.getFilePath(),
          },
          {
            filePath: operationPath('file2'),
            getFilePath: () => result.file2.getFilePath(),
          },
          {
            filePath: operationPath('dir2', 'file1'),
            getFilePath: () => result.dir2.file1.getFilePath(),
          },
          {
            filePath: operationPath('dir2', 'file2'),
            getFilePath: () => result.dir2.file2.getFilePath(),
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file1'),
            getFilePath: () => result.dir2.dir2.file1.getFilePath(),
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file2'),
            getFilePath: () => result.dir2.dir2.file2.getFilePath(),
          },
        ];

        files.forEach(({ filePath, getFilePath }) => {
          expect(getFilePath()).toBe(filePath);
        });
      });

      it('should return file path (fileCreate)', () => {
        useFileCreate((file, { path }) => {
          expect(file.getFilePath()).toBe(path);
        });
      });
    });

    describe('getFileData custom operation', () => {
      const { useFileCreate } = describeOperation(CustomOperations.GetFileData);

      it('should return file data (file tree)', () => {
        expect(result.file1.getFileData()).toBe(undefined);
        expect(result.file2.getFileData()).toBe(tree.file2.data);
        expect(result.dir2.file1.getFileData()).toBe(undefined);
        expect(result.dir2.file2.getFileData()).toBe(
          tree.dir2.children.file2.data(),
        );
        expect(result.dir2.dir2.file1.getFileData()).toBe(
          tree.dir2.children.dir2.children.file1.data,
        );
        expect(result.dir2.dir2.file2.getFileData()).toBe(
          tree.dir2.children.dir2.children.file2.data(),
        );
      });

      it('should return file data (fileCreate)', () => {
        useFileCreate((file, { data }) => {
          expect(file.getFileData()).toBe(data);
        });
      });
    });

    describe('getFileType custom operation', () => {
      const { useFileTreeFiles, useFileCreate } = describeOperation(
        CustomOperations.GetFileType,
      );

      it('should return file type (file tree)', () => {
        useFileTreeFiles((file) => {
          expect(file.getFileType()).toBe('file');
        });
      });

      it('should return file type (fileCreate)', () => {
        useFileCreate((file) => {
          expect(file.getFileType()).toBe('file');
        });
      });
    });

    describe('getFileSkip custom operation', () => {
      const { useFileCreate } = describeOperation(CustomOperations.GetFileSkip);

      it('should return skip value (file tree)', () => {
        expect(result.file1.getFileSkip()).toBe(undefined);
        expect(result.file2.getFileSkip()).toBe(tree.file2.skip);
        expect(result.dir2.file1.getFileSkip()).toBe(undefined);
        expect(result.dir2.file2.getFileSkip()).toBe(
          tree.dir2.children.file2.skip,
        );
        expect(result.dir2.dir2.file1.getFileSkip()).toBe(undefined);
        expect(result.dir2.dir2.file2.getFileSkip()).toBe(
          tree.dir2.children.dir2.children.file2.skip,
        );
      });

      it('should return skip value (fileCreate)', () => {
        useFileCreate((file) => {
          expect(file.getFileSkip()).toBe(false);
        });
      });
    });

    describe('plusOne custom operation', () => {
      const { useFileTreeFiles, useFileCreate } = describeOperation(
        CustomOperations.PlusOne,
      );

      it('should add 1 (file tree)', () => {
        useFileTreeFiles((file) => {
          expect(file.plusOne(1)).toBe(2);
        });
      });

      it('should add 1 (fileCreate)', () => {
        useFileCreate((file) => {
          expect(file.plusOne(1)).toBe(2);
        });
      });
    });
  },
);

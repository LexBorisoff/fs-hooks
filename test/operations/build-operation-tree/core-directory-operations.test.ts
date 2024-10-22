import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import type { FileTreeOperationsType } from '../../../src/operations/operation.types.js';
import { buildOperationTree } from '../../../src/operations/build-operation-tree.js';
import { testSetup } from '../../test-setup.js';
import type { FileInterface } from '../../../src/file-tree/file-tree.types.js';
import { deleteFolder } from '../../utils.js';
import {
  dirOperationsObject,
  fileOperationsObject,
  Test,
  tree,
  type Tree,
} from './constants.js';

const { setup, joinPath } = testSetup(Test.CoreDirOperations, import.meta);

enum CoreOperations {
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

    describe('getPath operation on directory objects', () => {
      const operationPath = describeOperation(CoreOperations.GetPath);

      it('should return directory path (file tree)', () => {
        interface TestItem {
          dirPath: string;
          getPath: () => string;
        }

        const dirs: TestItem[] = [
          {
            dirPath: operationPath(),
            getPath: () => result.$getPath(),
          },
          {
            dirPath: operationPath('dir1'),
            getPath: () => result.dir1.$getPath(),
          },
          {
            dirPath: operationPath('dir2'),
            getPath: () => result.dir2.$getPath(),
          },
          {
            dirPath: operationPath('dir2', 'dir1'),
            getPath: () => result.dir2.dir1.$getPath(),
          },
          {
            dirPath: operationPath('dir2', 'dir2'),
            getPath: () => result.dir2.dir2.$getPath(),
          },
        ];

        dirs.forEach(({ dirPath, getPath }) => {
          expect(getPath()).toBe(dirPath);
        });
      });

      it('should return directory path (dirCreate)', () => {
        fs.mkdirSync(operationPath('dir1'));
        fs.mkdirSync(operationPath('dir2', 'dir1'), { recursive: true });
        fs.mkdirSync(operationPath('dir2', 'dir2'));

        interface TestItem {
          dirPath: string;
          getPath: () => string;
        }

        const dirName = 'new-dir';
        const dirs: TestItem[] = [
          {
            dirPath: operationPath(dirName),
            getPath: () => result.$dirCreate(dirName).$getPath(),
          },
          {
            dirPath: operationPath('dir1', dirName),
            getPath: () => result.dir1.$dirCreate(dirName).$getPath(),
          },
          {
            dirPath: operationPath('dir2', dirName),
            getPath: () => result.dir2.$dirCreate(dirName).$getPath(),
          },
          {
            dirPath: operationPath('dir2', 'dir1', dirName),
            getPath: () => result.dir2.dir1.$dirCreate(dirName).$getPath(),
          },
          {
            dirPath: operationPath('dir2', 'dir2', dirName),
            getPath: () => result.dir2.dir2.$dirCreate(dirName).$getPath(),
          },
        ];

        dirs.forEach(({ getPath, dirPath }) => {
          expect(getPath()).toBe(dirPath);
        });
      });
    });

    describe('exists operation on directory objects', () => {
      const operationPath = describeOperation(CoreOperations.Exists);

      it('should check if files and directories exist (file tree)', () => {
        interface TestItem {
          path: string;
          exists: () => boolean;
        }

        const dirs: TestItem[] = [
          {
            path: operationPath('dir1'),
            exists: () => result.$exists('dir1'),
          },
          {
            path: operationPath('dir2'),
            exists: () => result.$exists('dir2'),
          },
          {
            path: operationPath('dir2', 'dir1'),
            exists: () => result.dir2.$exists('dir1'),
          },
          {
            path: operationPath('dir2', 'dir2'),
            exists: () => result.dir2.$exists('dir2'),
          },
        ];

        const files: TestItem[] = [
          {
            path: operationPath('file1'),
            exists: () => result.$exists('file1'),
          },
          {
            path: operationPath('file2'),
            exists: () => result.$exists('file2'),
          },
          {
            path: operationPath('dir2', 'file1'),
            exists: () => result.dir2.$exists('file1'),
          },
          {
            path: operationPath('dir2', 'file2'),
            exists: () => result.dir2.$exists('file2'),
          },
          {
            path: operationPath('dir2', 'dir2', 'file1'),
            exists: () => result.dir2.dir2.$exists('file1'),
          },
          {
            path: operationPath('dir2', 'dir2', 'file2'),
            exists: () => result.dir2.dir2.$exists('file2'),
          },
        ];

        function checkExists(value: boolean): void {
          dirs.concat(files).forEach(({ exists }) => {
            expect(exists()).toBe(value);
          });
        }

        // expect false before files and directories are created
        checkExists(false);

        // create files and directories in the file tree
        dirs.forEach(({ path: dirPath }) => {
          fs.mkdirSync(dirPath, { recursive: true });
        });
        files.forEach(({ path: filePath }) => {
          fs.writeFileSync(filePath, '');
        });

        // expect true after files and directories are created
        checkExists(true);
      });

      it('should check if files and directories exist (non file tree)', () => {
        const fileName = 'new-file';
        const dirName = 'new-dir';

        interface TestItem {
          path: string;
          exists: () => boolean;
        }

        const dirs: TestItem[] = [
          {
            path: operationPath(dirName),
            exists: () => result.$exists(dirName),
          },
          {
            path: operationPath('dir1', dirName),
            exists: () => result.dir1.$exists(dirName),
          },
          {
            path: operationPath('dir2', 'dir1', dirName),
            exists: () => result.dir2.dir1.$exists(dirName),
          },
        ];

        const files: TestItem[] = [
          {
            path: operationPath(fileName),
            exists: () => result.$exists(fileName),
          },
          {
            path: operationPath('dir1', fileName),
            exists: () => result.dir1.$exists(fileName),
          },
          {
            path: operationPath('dir2', 'dir1', fileName),
            exists: () => result.dir2.dir1.$exists(fileName),
          },
        ];

        function checkExists(value: boolean): void {
          dirs.concat(files).forEach(({ exists }) => {
            expect(exists()).toBe(value);
          });
        }

        // expect false before new files and directories are created
        checkExists(false);

        // create new files and directories
        dirs.forEach(({ path: dirPath }) => {
          fs.mkdirSync(dirPath, { recursive: true });
        });
        files.forEach(({ path: filePath }) => {
          fs.writeFileSync(filePath, '');
        });

        // expect true after new files and directories are created
        checkExists(true);
      });

      it('should check if files and directories exist (dirCreate)', () => {
        // TODO:
      });
    });

    describe('dirCreate operation', () => {
      const operationPath = describeOperation(CoreOperations.DirCreate);

      it('should return directory operations object (file tree)', () => {
        const dirName = 'new-dir';

        // create directories
        const dirs = [
          result.$dirCreate(dirName),
          result.dir1.$dirCreate(dirName),
          result.dir2.$dirCreate(dirName),
          result.dir2.dir1.$dirCreate(dirName),
          result.dir2.dir2.$dirCreate(dirName),
        ];

        // test created directory objects
        dirs.forEach((dir) => {
          expect(dir).toBeDefined();
          expect(dir).toEqual(dirOperationsObject);
        });
      });

      it('should return directory operations object (dirCreate)', () => {
        // TODO
      });

      it('should create directories (file tree)', () => {
        const dirName = 'new-dir';

        interface TestItem {
          dirPath: string;
          dirCreate: () => void;
        }

        const dirs: TestItem[] = [
          {
            dirPath: operationPath(dirName),
            dirCreate(): void {
              result.$dirCreate(dirName);
            },
          },
          {
            dirPath: operationPath('dir1', dirName),
            dirCreate(): void {
              result.dir1.$dirCreate(dirName);
            },
          },
          {
            dirPath: operationPath('dir2', 'dir1', dirName),
            dirCreate(): void {
              result.dir2.dir1.$dirCreate(dirName);
            },
          },
        ];

        function checkExists(value: boolean): void {
          dirs.forEach(({ dirPath }) => {
            expect(fs.existsSync(dirPath)).toBe(value);
          });
        }

        // expect false before directories are created
        checkExists(false);

        // create directories
        dirs.forEach(({ dirCreate }) => {
          dirCreate();
        });

        // expect true after directories are created
        checkExists(true);
      });

      it('should create directories (dirCreate)', () => {
        // TODO
      });
    });

    describe('dirDelete operation', () => {
      const operationPath = describeOperation(CoreOperations.DirDelete);

      it('should delete directories (file tree)', () => {
        const dirs = [
          operationPath('dir1'),
          operationPath('dir2'),
          operationPath('dir2', 'dir1'),
          operationPath('dir2', 'dir2'),
        ];

        function checkExists(value: boolean): void {
          dirs.forEach((dir) => {
            expect(fs.existsSync(dir)).toBe(value);
          });
        }

        // create directories manually to mock FileManager's create method
        dirs.forEach((dir) => {
          fs.mkdirSync(dir, { recursive: true });
        });

        // expect true before deleting directories
        checkExists(true);

        // delete directories
        result.$dirDelete('dir1');
        result.$dirDelete('dir2');
        result.dir2.$dirDelete('dir1');
        result.dir2.$dirDelete('dir2');

        // expect false after deleting directories
        checkExists(false);
      });

      it('should delete directories (non file tree)', () => {
        const dirName = 'new-dir';

        interface TestItem {
          dirPath: string;
          dirDelete: () => void;
        }

        const dirs: TestItem[] = [
          {
            dirPath: operationPath(dirName),
            dirDelete: () => result.$dirDelete(dirName),
          },
          {
            dirPath: operationPath('dir1', dirName),
            dirDelete: () => result.dir1.$dirDelete(dirName),
          },
          {
            dirPath: operationPath('dir2', dirName),
            dirDelete: () => result.dir2.$dirDelete(dirName),
          },
          {
            dirPath: operationPath('dir2', 'dir1', dirName),
            dirDelete: () => result.dir2.dir1.$dirDelete(dirName),
          },
          {
            dirPath: operationPath('dir2', 'dir2', dirName),
            dirDelete: () => result.dir2.dir2.$dirDelete(dirName),
          },
        ];

        function checkExists(value: boolean): void {
          dirs.forEach(({ dirPath }) => {
            expect(fs.existsSync(dirPath)).toBe(value);
          });
        }

        // create directories manually to mock FileManager's create method
        dirs.forEach(({ dirPath }) => {
          fs.mkdirSync(dirPath, { recursive: true });
        });

        // expect true before deleting directories
        checkExists(true);

        // delete directories
        dirs.forEach(({ dirDelete }) => {
          dirDelete();
        });

        // expect false after deleting directories
        checkExists(false);
      });

      it('should delete directories (dirCreate)', () => {
        // TODO
      });
    });

    describe('fileRead operation', () => {
      const operationPath = describeOperation(CoreOperations.FileRead);

      it('should read files (file tree)', () => {
        function getFileData({ data }: FileInterface): string {
          return data instanceof Function ? data() : (data ?? '');
        }

        interface TestItem {
          data: string;
          filePath: string;
          fileRead: () => string | null;
        }

        const files: TestItem[] = [
          {
            data: getFileData(tree.file1),
            filePath: operationPath('file1'),
            fileRead: () => result.$fileRead('file1'),
          },
          {
            data: getFileData(tree.file2),
            filePath: operationPath('file2'),
            fileRead: () => result.$fileRead('file2'),
          },
          {
            data: getFileData(tree.dir2.children.file1),
            filePath: operationPath('dir2', 'file1'),
            fileRead: () => result.dir2.$fileRead('file1'),
          },
          {
            data: getFileData(tree.dir2.children.file2),
            filePath: operationPath('dir2', 'file2'),
            fileRead: () => result.dir2.$fileRead('file2'),
          },
          {
            data: getFileData(tree.dir2.children.dir2.children.file1),
            filePath: operationPath('dir2', 'dir2', 'file1'),
            fileRead: () => result.dir2.dir2.$fileRead('file1'),
          },
          {
            data: getFileData(tree.dir2.children.dir2.children.file2),
            filePath: operationPath('dir2', 'dir2', 'file2'),
            fileRead: () => result.dir2.dir2.$fileRead('file2'),
          },
        ];

        // create files manually to mock FileManager's create method
        fs.mkdirSync(operationPath('dir2', 'dir2'), { recursive: true });
        files.forEach(({ data, filePath, fileRead }) => {
          fs.writeFileSync(filePath, data);
          expect(fileRead()).toBe(data);
        });
      });

      it('should read files (non file tree)', () => {
        const fileName = 'new-file';
        const fileData = [
          'New File Test',
          'New File Test\nNew File Test',
          'New File Test\nNew File Test\nNew File Test',
        ];

        interface TestItem {
          filePath: string;
          fileRead: () => string | null;
        }

        const files: TestItem[] = [
          {
            filePath: operationPath(fileName),
            fileRead: () => result.$fileRead(fileName),
          },
          {
            filePath: operationPath('dir1', fileName),
            fileRead: () => result.dir1.$fileRead(fileName),
          },
          {
            filePath: operationPath('dir2', fileName),
            fileRead: () => result.dir2.$fileRead(fileName),
          },
          {
            filePath: operationPath('dir2', 'dir1', fileName),
            fileRead: () => result.dir2.dir1.$fileRead(fileName),
          },
          {
            filePath: operationPath('dir2', 'dir2', fileName),
            fileRead: () => result.dir2.dir2.$fileRead(fileName),
          },
        ];

        // create files manually
        fs.mkdirSync(operationPath('dir1'));
        fs.mkdirSync(operationPath('dir2', 'dir1'), { recursive: true });
        fs.mkdirSync(operationPath('dir2', 'dir2'));

        files.forEach(({ filePath, fileRead }) => {
          fileData.forEach((data) => {
            fs.writeFileSync(filePath, data);
            expect(fileRead()).toBe(data);
          });
        });
      });

      it('it should read files (dirCreate)', () => {
        // TODO
      });

      it('should return null when reading a non-existent file (file tree)', () => {
        const dirs = [
          result,
          result.dir1,
          result.dir2,
          result.dir2.dir1,
          result.dir2.dir2,
        ];

        dirs.forEach((dir) => {
          expect(dir.$fileRead('non-existent')).toBe(null);
        });
      });

      it('should return null when reading a non-existent file (dirCreate)', () => {
        // TODO
      });
    });

    describe('fileCreate operation', () => {
      const operationPath = describeOperation(CoreOperations.FileCreate);

      it('should return file operations object (file tree)', () => {
        const fileName = 'new-file';
        fs.mkdirSync(operationPath('dir1'));
        fs.mkdirSync(operationPath('dir2', 'dir1'), { recursive: true });
        fs.mkdirSync(operationPath('dir2', 'dir2'));

        // create files
        const files = [
          result.$fileCreate(fileName),
          result.dir1.$fileCreate(fileName),
          result.dir2.$fileCreate(fileName),
          result.dir2.dir1.$fileCreate(fileName),
          result.dir2.dir2.$fileCreate(fileName),
        ];

        // test created file objects
        files.forEach((file) => {
          expect(file).toBeDefined();
          expect(file).toEqual(fileOperationsObject);
        });
      });

      it('should return file operations object (dirCreate)', () => {
        //
      });

      it('should create files (file tree)', () => {
        const fileName = 'new-file';

        interface TestItem {
          filePath: string;
          fileCreate: () => void;
        }

        const files: TestItem[] = [
          {
            filePath: operationPath(fileName),
            fileCreate(): void {
              result.$fileCreate(fileName);
            },
          },
          {
            filePath: operationPath('dir1', fileName),
            fileCreate(): void {
              result.dir1.$fileCreate(fileName);
            },
          },
          {
            filePath: operationPath('dir2', fileName),
            fileCreate(): void {
              result.dir2.$fileCreate(fileName);
            },
          },
          {
            filePath: operationPath('dir2', 'dir1', fileName),
            fileCreate(): void {
              result.dir2.dir1.$fileCreate(fileName);
            },
          },
          {
            filePath: operationPath('dir2', 'dir2', fileName),
            fileCreate(): void {
              result.dir2.dir2.$fileCreate(fileName);
            },
          },
        ];

        function checkExists(value: boolean): void {
          files.forEach(({ filePath }) => {
            expect(fs.existsSync(filePath)).toBe(value);
          });
        }

        fs.mkdirSync(operationPath('dir1'));
        fs.mkdirSync(operationPath('dir2', 'dir1'), { recursive: true });
        fs.mkdirSync(operationPath('dir2', 'dir2'));

        // expect false before files are created
        checkExists(false);

        // create files
        files.forEach(({ fileCreate }) => {
          fileCreate();
        });

        // expect true after files are created
        checkExists(true);
      });

      it('should create files (dirCreate)', () => {
        // TODO
      });

      it('should create a nested file in an existing folder (file tree)', () => {
        const nestedFileName = 'dir2/dir1/new-file-2';
        const nestedFilePath = operationPath(nestedFileName);

        function checkExists(value: boolean): void {
          expect(fs.existsSync(nestedFilePath)).toBe(value);
        }

        // expect false before a nested file is created
        checkExists(false);

        // create a nested file
        fs.mkdirSync(operationPath('dir2', 'dir1'), { recursive: true });
        result.$fileCreate(nestedFileName);

        // expect true after a nested file is created
        checkExists(true);
      });

      it('should create a nested file in an existing folder (dirCreate)', () => {
        // TODO
      });

      it('should throw when creating a nested file in a non-existing folder (file tree)', () => {
        const dirs = [
          result,
          result.dir1,
          result.dir2,
          result.dir2.dir1,
          result.dir2.dir2,
        ];

        dirs.forEach((dir) => {
          expect(() => dir.$fileCreate('new-dir/new-file')).toThrow();
        });
      });

      it('should throw when creating a nested file in a non-existing folder (dirCreate)', () => {
        fs.mkdirSync(operationPath('dir1'));
        fs.mkdirSync(operationPath('dir2', 'dir1'), { recursive: true });
        fs.mkdirSync(operationPath('dir2', 'dir2'));

        const dirName = 'new-dir';
        const dirs = [
          result.$dirCreate(dirName),
          result.dir1.$dirCreate(dirName),
          result.dir2.$dirCreate(dirName),
          result.dir2.dir1.$dirCreate(dirName),
          result.dir2.dir2.$dirCreate(dirName),
        ];

        dirs.forEach((dir) => {
          expect(() => dir.$fileCreate('new-dir/new-file')).toThrow();
        });
      });
    });

    describe('fileDelete operation', () => {
      const operationPath = describeOperation(CoreOperations.FileDelete);

      function useFileDelete(filePaths: string[]): {
        checkExists: (value: boolean) => void;
        createFiles: () => void;
      } {
        const files = filePaths.reduce<Record<string, string>>(
          (acc, filePath, i) => {
            acc[`file${i + 1}`] = filePath;
            return acc;
          },
          {},
        );
        const { length } = Object.keys(files);

        function getFileProp(i: number): string {
          return `file${i + 1}`;
        }

        function checkExists(value: boolean): void {
          Array.from({ length }).map((_, i) => {
            expect(fs.existsSync(files[getFileProp(i)])).toBe(value);
          });
        }

        function createFiles(): void {
          Array.from({ length }).map((_, i) => {
            fs.writeFileSync(files[getFileProp(i)], '');
          });
        }
        return {
          checkExists,
          createFiles,
        };
      }

      it('should delete specified files (file tree)', () => {
        interface TestItem {
          filePath: string;
          fileDelete: () => void;
        }

        const files: TestItem[] = [
          {
            filePath: operationPath('file1'),
            fileDelete(): void {
              result.$fileDelete('file1');
            },
          },
          {
            filePath: operationPath('file2'),
            fileDelete(): void {
              result.$fileDelete('file2');
            },
          },
          {
            filePath: operationPath('dir2', 'file1'),
            fileDelete(): void {
              result.dir2.$fileDelete('file1');
            },
          },
          {
            filePath: operationPath('dir2', 'file2'),
            fileDelete(): void {
              result.dir2.$fileDelete('file2');
            },
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file1'),
            fileDelete(): void {
              result.dir2.dir2.$fileDelete('file1');
            },
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file2'),
            fileDelete(): void {
              result.dir2.dir2.$fileDelete('file2');
            },
          },
        ];

        const { checkExists, createFiles } = useFileDelete(
          files.map(({ filePath }) => filePath),
        );

        // create files
        fs.mkdirSync(operationPath('dir2', 'dir2'), { recursive: true });
        createFiles();

        // expect true before deleting files
        checkExists(true);

        // delete files
        files.forEach(({ fileDelete }) => {
          fileDelete();
        });

        // expect false after deleting files
        checkExists(false);
      });

      it('should delete specified files (non file tree)', () => {
        const fileName = 'new-file';

        interface TestItem {
          filePath: string;
          fileDelete: () => void;
        }

        const files: TestItem[] = [
          {
            filePath: operationPath(fileName),
            fileDelete(): void {
              result.$fileDelete(fileName);
            },
          },
          {
            filePath: operationPath('dir1', fileName),
            fileDelete(): void {
              result.dir1.$fileDelete(fileName);
            },
          },
          {
            filePath: operationPath('dir2', fileName),
            fileDelete(): void {
              result.dir2.$fileDelete(fileName);
            },
          },
          {
            filePath: operationPath('dir2', 'dir1', fileName),
            fileDelete(): void {
              result.dir2.dir1.$fileDelete(fileName);
            },
          },
          {
            filePath: operationPath('dir2', 'dir2', fileName),
            fileDelete(): void {
              result.dir2.dir2.$fileDelete(fileName);
            },
          },
        ];

        const { checkExists, createFiles } = useFileDelete(
          files.map(({ filePath }) => filePath),
        );

        // create files
        fs.mkdirSync(operationPath('dir1'));
        fs.mkdirSync(operationPath('dir2', 'dir1'), { recursive: true });
        fs.mkdirSync(operationPath('dir2', 'dir2'));
        createFiles();

        // expect true before deleting files
        checkExists(true);

        // delete files
        files.forEach(({ fileDelete }) => {
          fileDelete();
        });

        // expect false after deleting files
        checkExists(false);
      });

      it('should delete specified files (dirCreate)', () => {
        // TODO
      });
    });

    describe('fileWrite operation', () => {
      const operationPath = describeOperation(CoreOperations.FileWrite);

      function useFileWrite(
        filePaths: string[],
        fileData: string,
      ): {
        createFiles: () => void;
        checkFileData: () => void;
      } {
        function createFiles(): void {
          filePaths.forEach((filePath) => {
            fs.writeFileSync(filePath, '');
          });
        }

        function checkFileData(): void {
          filePaths.forEach((filePath) => {
            const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
            expect(data).toBe(fileData);
          });
        }

        return {
          createFiles,
          checkFileData,
        };
      }

      it('should write to specified files (file tree)', () => {
        const fileData = 'Hello, World!';

        interface TestItem {
          filePath: string;
          fileWrite: () => void;
        }

        const files: TestItem[] = [
          {
            filePath: operationPath('file1'),
            fileWrite(): void {
              result.$fileWrite('file1', fileData);
            },
          },
          {
            filePath: operationPath('file2'),
            fileWrite(): void {
              result.$fileWrite('file2', fileData);
            },
          },
          {
            filePath: operationPath('dir2', 'file1'),
            fileWrite(): void {
              result.dir2.$fileWrite('file1', fileData);
            },
          },
          {
            filePath: operationPath('dir2', 'file2'),
            fileWrite(): void {
              result.dir2.$fileWrite('file2', fileData);
            },
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file1'),
            fileWrite(): void {
              result.dir2.dir2.$fileWrite('file1', fileData);
            },
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file2'),
            fileWrite(): void {
              result.dir2.dir2.$fileWrite('file2', fileData);
            },
          },
        ];

        // create files
        const { createFiles, checkFileData } = useFileWrite(
          files.map(({ filePath }) => filePath),
          fileData,
        );
        fs.mkdirSync(operationPath('dir2', 'dir2'), { recursive: true });
        createFiles();

        // write data to files
        files.forEach(({ fileWrite }) => {
          fileWrite();
        });

        // test file data
        checkFileData();
      });

      it('should write to specified files (non file tree)', () => {
        const fileData = 'Hello, World!';
        const fileName = 'new-file';

        interface TestItem {
          filePath: string;
          fileWrite: () => void;
        }

        const files: TestItem[] = [
          {
            filePath: operationPath(fileName),
            fileWrite(): void {
              result.$fileWrite(fileName, fileData);
            },
          },
          {
            filePath: operationPath('dir1', fileName),
            fileWrite(): void {
              result.dir1.$fileWrite(fileName, fileData);
            },
          },
          {
            filePath: operationPath('dir2', fileName),
            fileWrite(): void {
              result.dir2.$fileWrite(fileName, fileData);
            },
          },
          {
            filePath: operationPath('dir2', 'dir1', fileName),
            fileWrite(): void {
              result.dir2.dir1.$fileWrite(fileName, fileData);
            },
          },
          {
            filePath: operationPath('dir2', 'dir2', fileName),
            fileWrite(): void {
              result.dir2.dir2.$fileWrite(fileName, fileData);
            },
          },
        ];

        // create files
        const { createFiles, checkFileData } = useFileWrite(
          files.map(({ filePath }) => filePath),
          fileData,
        );
        fs.mkdirSync(operationPath('dir1'));
        fs.mkdirSync(operationPath('dir2', 'dir1'), { recursive: true });
        fs.mkdirSync(operationPath('dir2', 'dir2'));

        createFiles();

        // write data to files
        files.forEach(({ fileWrite }) => {
          fileWrite();
        });

        // test file data
        checkFileData();
      });

      it('should write to specified files (dirCreate)', () => {
        // TODO
      });
    });

    describe('fileClear operation', () => {
      const operationPath = describeOperation(CoreOperations.FileClear);

      function useFileClear(filePaths: string[]): {
        createFiles: () => void;
        checkFileData: () => void;
      } {
        function createFiles(): void {
          const initialData = 'Hello, World!';

          filePaths.forEach((filePath) => {
            fs.writeFileSync(filePath, initialData);
          });

          // test initial file data
          filePaths.forEach((filePath) => {
            const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
            expect(data).toBe(initialData);
          });
        }

        function checkFileData(): void {
          filePaths.forEach((filePath) => {
            const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
            expect(data).toBe('');
          });
        }

        return {
          createFiles,
          checkFileData,
        };
      }

      it('should clear data for specified files (file tree)', () => {
        interface TestItem {
          filePath: string;
          fileClear: () => void;
        }

        const files: TestItem[] = [
          {
            filePath: operationPath('file1'),
            fileClear(): void {
              result.$fileClear('file1');
            },
          },

          {
            filePath: operationPath('file2'),
            fileClear(): void {
              result.$fileClear('file2');
            },
          },

          {
            filePath: operationPath('dir2', 'file1'),
            fileClear(): void {
              result.dir2.$fileClear('file1');
            },
          },

          {
            filePath: operationPath('dir2', 'file2'),
            fileClear(): void {
              result.dir2.$fileClear('file2');
            },
          },

          {
            filePath: operationPath('dir2', 'dir2', 'file1'),
            fileClear(): void {
              result.dir2.dir2.$fileClear('file1');
            },
          },

          {
            filePath: operationPath('dir2', 'dir2', 'file2'),
            fileClear(): void {
              result.dir2.dir2.$fileClear('file2');
            },
          },
        ];

        // create files
        const { createFiles, checkFileData } = useFileClear(
          files.map(({ filePath }) => filePath),
        );
        fs.mkdirSync(operationPath('dir2', 'dir2'), { recursive: true });
        createFiles();

        // clear file data
        files.forEach(({ fileClear }) => {
          fileClear();
        });

        // test cleared file data
        checkFileData();
      });

      it('should clear data for specified files (non file tree)', () => {
        const fileName = 'new-file';

        interface TestItem {
          filePath: string;
          fileClear: () => void;
        }

        const files: TestItem[] = [
          {
            filePath: operationPath(fileName),
            fileClear(): void {
              result.$fileClear(fileName);
            },
          },
          {
            filePath: operationPath('dir1', fileName),
            fileClear(): void {
              result.dir1.$fileClear(fileName);
            },
          },
          {
            filePath: operationPath('dir2', fileName),
            fileClear(): void {
              result.dir2.$fileClear(fileName);
            },
          },
          {
            filePath: operationPath('dir2', 'dir1', fileName),
            fileClear(): void {
              result.dir2.dir1.$fileClear(fileName);
            },
          },
          {
            filePath: operationPath('dir2', 'dir2', fileName),
            fileClear(): void {
              result.dir2.dir2.$fileClear(fileName);
            },
          },
        ];

        // create files
        const { createFiles, checkFileData } = useFileClear(
          files.map(({ filePath }) => filePath),
        );
        fs.mkdirSync(operationPath('dir1'));
        fs.mkdirSync(operationPath('dir2', 'dir1'), { recursive: true });
        fs.mkdirSync(operationPath('dir2', 'dir2'));
        createFiles();

        // clear file data
        files.forEach(({ fileClear }) => {
          fileClear();
        });

        // test cleared file data
        checkFileData();
      });

      it('should clear data for specified files (dirCreate)', () => {
        // TODO
      });
    });
  },
);

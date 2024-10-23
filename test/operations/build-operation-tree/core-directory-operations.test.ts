import fs from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import type {
  DirOperationsInterface,
  FileTreeOperationsType,
} from '../../../src/operations/operation.types.js';
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

function getFileDataArray(): string[] {
  return [
    'New File Test 1',
    'New File Test 1\nNew File Test 2',
    'New File Test 1\nNew File Test 2\nNew File Test 3',
  ];
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

    type DirType = DirOperationsInterface<undefined, undefined, undefined>;

    interface UseFileTreeDirsCbOptions {
      dir: DirType;
      parentDirs: string[];
    }

    type UseFileTreeDirsCb = (options: UseFileTreeDirsCbOptions) => void;

    function useFileTreeDirs(cb: UseFileTreeDirsCb): void {
      const dirs: UseFileTreeDirsCbOptions[] = [
        {
          dir: result,
          parentDirs: [],
        },
        {
          dir: result.dir1,
          parentDirs: ['dir1'],
        },
        {
          dir: result.dir2,
          parentDirs: ['dir2'],
        },
        {
          dir: result.dir2.dir1,
          parentDirs: ['dir2', 'dir1'],
        },
        {
          dir: result.dir2.dir2,
          parentDirs: ['dir2', 'dir2'],
        },
      ];

      dirs.forEach((dir) => {
        cb(dir);
      });
    }

    interface UseDirCreateCbOptions {
      parentDirs: string[];
      getDir: () => DirType;
    }

    type UseDirCreateCb = (options: UseDirCreateCbOptions) => void;

    function useDirCreate(cb: UseDirCreateCb): void {
      const dirName = 'new-dir';

      function getDir(dir: DirType): () => DirType {
        return function () {
          return dir.$dirCreate(dirName);
        };
      }

      const dirs: UseDirCreateCbOptions[] = [
        {
          parentDirs: [],
          getDir: getDir(result),
        },
        {
          parentDirs: ['dir1'],
          getDir: getDir(result.dir1),
        },
        {
          parentDirs: ['dir2'],
          getDir: getDir(result.dir2),
        },
        {
          parentDirs: ['dir2', 'dir1'],
          getDir: getDir(result.dir2.dir1),
        },
        {
          parentDirs: ['dir2', 'dir2'],
          getDir: getDir(result.dir2.dir2),
        },
      ].map(({ parentDirs, ...dir }) => ({
        ...dir,
        parentDirs: [...parentDirs, dirName],
      }));

      dirs.forEach((dir) => {
        cb(dir);
      });
    }

    describe('getPath operation on directory objects', () => {
      const operationPath = describeOperation(CoreOperations.GetPath);

      it('should return directory path (file tree)', () => {
        useFileTreeDirs(({ dir, parentDirs }) => {
          const dirPath = operationPath(...parentDirs);
          expect(dir.$getPath()).toBe(dirPath);
        });
      });

      it('should return directory path (dirCreate)', () => {
        useDirCreate(({ getDir, parentDirs }) => {
          const dir = getDir();
          const dirPath = operationPath(...parentDirs);
          expect(dir.$getPath()).toBe(dirPath);
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
        const dirName = 'new-dir';
        const fileName = 'new-file';

        useFileTreeDirs(({ dir, parentDirs }) => {
          // expect false before creating test directory and file
          expect(dir.$exists(dirName)).toBe(false);
          expect(dir.$exists(fileName)).toBe(false);

          // create test directory and file manually
          const dirPath = operationPath(...parentDirs, dirName);
          const filePath = operationPath(...parentDirs, fileName);
          fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(filePath, '');

          // expect true after creating test directory and file
          expect(dir.$exists(dirName)).toBe(true);
          expect(dir.$exists(fileName)).toBe(true);
        });
      });

      it('should check if files and directories exist (dirCreate)', () => {
        const testFile = 'test-file';
        const testDir = 'test-dir';

        useDirCreate(({ parentDirs, getDir }) => {
          const dir = getDir();

          // expect false before creating test directory and file
          expect(dir.$exists(testDir)).toBe(false);
          expect(dir.$exists(testFile)).toBe(false);

          // create test directory and file manually
          fs.mkdirSync(operationPath(...parentDirs, testDir));
          fs.writeFileSync(operationPath(...parentDirs, testFile), '');

          // expect true after creating test directory and file
          expect(dir.$exists(testDir)).toBe(true);
          expect(dir.$exists(testFile)).toBe(true);
        });
      });
    });

    describe('dirCreate operation', () => {
      const operationPath = describeOperation(CoreOperations.DirCreate);

      it('should return directory operations object (file tree)', () => {
        const dirName = 'new-dir';

        // create directories
        const dirs = [
          result,
          result.dir1,
          result.dir2,
          result.dir2.dir1,
          result.dir2.dir2,
        ].map((dir) => dir.$dirCreate(dirName));

        // test created directory objects
        dirs.forEach((dir) => {
          expect(dir).toEqual(dirOperationsObject);
        });
      });

      it('should return directory operations object (dirCreate)', () => {
        const dirName = 'new-dir';
        useDirCreate(({ getDir }) => {
          const dir = getDir();
          const createdDir = dir.$dirCreate(dirName);
          expect(createdDir).toEqual(dirOperationsObject);
        });
      });

      it('should create directories (file tree)', () => {
        const dirName = 'new-dir';

        useFileTreeDirs(({ dir, parentDirs }) => {
          const dirPath = operationPath(...parentDirs, dirName);

          // expect false before creating the directory
          expect(fs.existsSync(dirPath)).toBe(false);

          // create the directory
          dir.$dirCreate(dirName);

          // expect true after creating the directory
          expect(fs.existsSync(dirPath)).toBe(true);
          expect(fs.statSync(dirPath).isDirectory()).toBe(true);
        });
      });

      it('should create directories (dirCreate)', () => {
        const dirName = 'new-dir';

        useDirCreate(({ getDir, parentDirs }) => {
          const dir = getDir();
          const dirPath = operationPath(...parentDirs, dirName);

          // expect false before creating the directory
          expect(fs.existsSync(dirPath)).toBe(false);

          // create the directory
          dir.$dirCreate(dirName);

          // expect true after creating the directory
          expect(fs.existsSync(dirPath)).toBe(true);
          expect(fs.statSync(dirPath).isDirectory()).toBe(true);
        });
      });
    });

    describe('dirDelete operation', () => {
      const operationPath = describeOperation(CoreOperations.DirDelete);

      it('should delete directories (file tree)', () => {
        interface TestItem {
          dirPath: string;
          dirDelete: () => void;
        }

        const dirs: TestItem[] = [
          {
            dirPath: operationPath('dir1'),
            dirDelete: () => result.$dirDelete('dir1'),
          },
          {
            dirPath: operationPath('dir2'),
            dirDelete: () => result.$dirDelete('dir2'),
          },
          {
            dirPath: operationPath('dir2', 'dir1'),
            dirDelete: () => result.dir2.$dirDelete('dir1'),
          },
          {
            dirPath: operationPath('dir2', 'dir2'),
            dirDelete: () => result.dir2.$dirDelete('dir2'),
          },
        ];

        // create directories manually to mock FileManager's create method
        dirs.forEach(({ dirPath }) => {
          fs.mkdirSync(dirPath, { recursive: true });
          expect(fs.existsSync(dirPath)).toBe(true);
        });

        // delete directories
        dirs.forEach(({ dirDelete, dirPath }) => {
          dirDelete();
          expect(fs.existsSync(dirPath)).toBe(false);
        });
      });

      it('should delete directories (non file tree)', () => {
        const dirName = 'new-dir';

        function getDirPath(parentDirs: string[]): string {
          return operationPath(...parentDirs, dirName);
        }

        // create directories manually to mock FileManager's create method
        useFileTreeDirs(({ dir, parentDirs }) => {
          const dirPath = getDirPath(parentDirs);

          // create the directory
          fs.mkdirSync(dirPath, { recursive: true });
          expect(fs.existsSync(dirPath)).toBe(true);

          // delete the directory
          dir.$dirDelete(dirName);
          expect(fs.existsSync(dirPath)).toBe(false);
        });
      });

      it('should delete directories (dirCreate)', () => {
        const dirName = 'new-dir';

        useDirCreate(({ getDir, parentDirs }) => {
          // create the directory
          const dir = getDir();
          const dirPath = operationPath(...parentDirs, dirName);
          fs.mkdirSync(dirPath);
          expect(fs.existsSync(dirPath)).toBe(true);

          // delete the directory
          dir.$dirDelete(dirName);
          expect(fs.existsSync(dirPath)).toBe(false);
        });
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
        const fileData = getFileDataArray();

        fs.mkdirSync(operationPath('dir1'));
        fs.mkdirSync(operationPath('dir2', 'dir1'), { recursive: true });
        fs.mkdirSync(operationPath('dir2', 'dir2'));

        useFileTreeDirs(({ dir, parentDirs }) => {
          const filePath = operationPath(...parentDirs, fileName);

          fileData.forEach((data) => {
            fs.writeFileSync(filePath, data);
            expect(dir.$fileRead(fileName)).toBe(data);
          });
        });
      });

      it('it should read files (dirCreate)', () => {
        const fileName = 'new-file';
        const fileData = getFileDataArray();

        useDirCreate(({ getDir, parentDirs }) => {
          const dir = getDir();
          const filePath = operationPath(...parentDirs, fileName);

          fileData.forEach((data) => {
            fs.writeFileSync(filePath, data);
            expect(dir.$fileRead(fileName)).toBe(data);
          });
        });
      });

      it('should return null when reading a non-existent file (file tree)', () => {
        useFileTreeDirs(({ dir }) => {
          expect(dir.$fileRead('non-existent')).toBe(null);
        });
      });

      it('should return null when reading a non-existent file (dirCreate)', () => {
        useDirCreate(({ getDir }) => {
          const dir = getDir();
          expect(dir.$fileRead('non-existent')).toBe(null);
        });
      });
    });

    describe('fileCreate operation', () => {
      const operationPath = describeOperation(CoreOperations.FileCreate);

      it('should return file operations object (file tree)', () => {
        fs.mkdirSync(operationPath('dir1'));
        fs.mkdirSync(operationPath('dir2', 'dir1'), { recursive: true });
        fs.mkdirSync(operationPath('dir2', 'dir2'));

        const fileName = 'new-file';

        useFileTreeDirs(({ dir }) => {
          const file = dir.$fileCreate(fileName);
          expect(file).toEqual(fileOperationsObject);
        });
      });

      it('should return file operations object (dirCreate)', () => {
        const fileName = 'new-file';

        useDirCreate(({ getDir }) => {
          const dir = getDir();
          const file = dir.$fileCreate(fileName);
          expect(file).toEqual(fileOperationsObject);
        });
      });

      it('should create files (file tree)', () => {
        const fileName = 'new-file';

        interface TestItem {
          dir: DirType;
          filePath: string;
        }

        const files: TestItem[] = [
          {
            dir: result,
            filePath: operationPath(fileName),
          },
          {
            dir: result.dir1,
            filePath: operationPath('dir1', fileName),
          },
          {
            dir: result.dir2,
            filePath: operationPath('dir2', fileName),
          },
          {
            dir: result.dir2.dir1,
            filePath: operationPath('dir2', 'dir1', fileName),
          },
          {
            dir: result.dir2.dir2,
            filePath: operationPath('dir2', 'dir2', fileName),
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
        files.forEach(({ dir }) => {
          dir.$fileCreate(fileName);
        });

        // expect true after files are created
        checkExists(true);
      });

      it('should create files (dirCreate)', () => {
        const fileName = 'new-file';

        useDirCreate(({ getDir, parentDirs }) => {
          const dir = getDir();
          const filePath = operationPath(...parentDirs, fileName);

          // expect false before creating a file
          expect(fs.existsSync(filePath)).toBe(false);

          // create a file
        });
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
            fileDelete: () => result.$fileDelete('file1'),
          },
          {
            filePath: operationPath('file2'),
            fileDelete: () => result.$fileDelete('file2'),
          },
          {
            filePath: operationPath('dir2', 'file1'),
            fileDelete: () => result.dir2.$fileDelete('file1'),
          },
          {
            filePath: operationPath('dir2', 'file2'),
            fileDelete: () => result.dir2.$fileDelete('file2'),
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file1'),
            fileDelete: () => result.dir2.dir2.$fileDelete('file1'),
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file2'),
            fileDelete: () => result.dir2.dir2.$fileDelete('file2'),
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
            fileDelete: () => result.$fileDelete(fileName),
          },
          {
            filePath: operationPath('dir1', fileName),
            fileDelete: () => result.dir1.$fileDelete(fileName),
          },
          {
            filePath: operationPath('dir2', fileName),
            fileDelete: () => result.dir2.$fileDelete(fileName),
          },
          {
            filePath: operationPath('dir2', 'dir1', fileName),
            fileDelete: () => result.dir2.dir1.$fileDelete(fileName),
          },
          {
            filePath: operationPath('dir2', 'dir2', fileName),
            fileDelete: () => result.dir2.dir2.$fileDelete(fileName),
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
            fileWrite: () => result.$fileWrite('file1', fileData),
          },
          {
            filePath: operationPath('file2'),
            fileWrite: () => result.$fileWrite('file2', fileData),
          },
          {
            filePath: operationPath('dir2', 'file1'),
            fileWrite: () => result.dir2.$fileWrite('file1', fileData),
          },
          {
            filePath: operationPath('dir2', 'file2'),
            fileWrite: () => result.dir2.$fileWrite('file2', fileData),
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file1'),
            fileWrite: () => result.dir2.dir2.$fileWrite('file1', fileData),
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file2'),
            fileWrite: () => result.dir2.dir2.$fileWrite('file2', fileData),
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
            fileWrite: () => result.$fileWrite(fileName, fileData),
          },
          {
            filePath: operationPath('dir1', fileName),
            fileWrite: () => result.dir1.$fileWrite(fileName, fileData),
          },
          {
            filePath: operationPath('dir2', fileName),
            fileWrite: () => result.dir2.$fileWrite(fileName, fileData),
          },
          {
            filePath: operationPath('dir2', 'dir1', fileName),
            fileWrite: () => result.dir2.dir1.$fileWrite(fileName, fileData),
          },
          {
            filePath: operationPath('dir2', 'dir2', fileName),
            fileWrite: () => result.dir2.dir2.$fileWrite(fileName, fileData),
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
            fileClear: () => result.$fileClear('file1'),
          },
          {
            filePath: operationPath('file2'),
            fileClear: () => result.$fileClear('file2'),
          },
          {
            filePath: operationPath('dir2', 'file1'),
            fileClear: () => result.dir2.$fileClear('file1'),
          },
          {
            filePath: operationPath('dir2', 'file2'),
            fileClear: () => result.dir2.$fileClear('file2'),
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file1'),
            fileClear: () => result.dir2.dir2.$fileClear('file1'),
          },
          {
            filePath: operationPath('dir2', 'dir2', 'file2'),
            fileClear: () => result.dir2.dir2.$fileClear('file2'),
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
            fileClear: () => result.$fileClear(fileName),
          },
          {
            filePath: operationPath('dir1', fileName),
            fileClear: () => result.dir1.$fileClear(fileName),
          },
          {
            filePath: operationPath('dir2', fileName),
            fileClear: () => result.dir2.$fileClear(fileName),
          },
          {
            filePath: operationPath('dir2', 'dir1', fileName),
            fileClear: () => result.dir2.dir1.$fileClear(fileName),
          },
          {
            filePath: operationPath('dir2', 'dir2', fileName),
            fileClear: () => result.dir2.dir2.$fileClear(fileName),
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

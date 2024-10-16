import fs from 'node:fs';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  suite,
} from 'vitest';
import { testSetup } from '../test-setup.js';
import type {
  DirOperationsInterface,
  FileOperationsInterface,
  FileOperationTreeType,
} from '../../src/operations/operation.types.js';
import type {
  FileInterface,
  FileTreeInterface,
} from '../../src/file-tree/file-tree.types.js';
import { buildOperationTree } from '../../src/operations/build-operation-tree.js';
import {
  buildDirOperations,
  buildFileOperations,
} from '../../src/operations/build-operations.js';
import { dirOperationMethods, fileOperationMethods } from './constants.js';

const { setup, joinPath } = testSetup('build-operation-tree', import.meta);

function getJoinTestPath(testName: string) {
  return function getJoinPath(...args: string[]): string {
    return joinPath(testName, ...args);
  };
}

suite('buildOperationTree Suite', { concurrent: false }, () => {
  const tree = {
    file1: { type: 'file' },
    file2: { type: 'file', data: 'File 2 test', skip: true },
    dir1: { type: 'dir' },
    dir2: {
      type: 'dir',
      children: {
        file1: { type: 'file' },
        file2: {
          type: 'file',
          data: (): string => 'Dir 2\nFile 2 test',
          skip: false,
        },
        dir1: { type: 'dir' },
        dir2: {
          type: 'dir',
          children: {
            file1: { type: 'file', data: 'Dir 2\nDir 2\nFile 1 test' },
            file2: {
              type: 'file',
              data: (): string => 'Dir 2\nDir 2\nFile 2 test',
              skip: true,
            },
          },
        },
      },
    },
  } satisfies FileTreeInterface;

  type Tree = typeof tree;

  beforeAll(() => {
    return setup();
  });

  describe('buildOperationTree function - core properties', () => {
    const testName = 'core-methods';
    const testDirPath = joinPath(testName);
    const joinTestPath = getJoinTestPath(testName);
    let result: FileOperationTreeType<Tree>;

    beforeEach(() => {
      fs.mkdirSync(testDirPath, { recursive: true });
      result = buildOperationTree(testDirPath, tree);
    });

    afterEach(() => {
      fs.rmSync(testDirPath, {
        force: true,
        recursive: true,
      });
    });

    it('should be defined', () => {
      expect(result).toBeDefined();
    });

    it('should have directory operation methods on result object', () => {
      dirOperationMethods.forEach((method) => {
        expect(result).toHaveProperty(method);
        expect(result[method]).toBeInstanceOf(Function);
      });
    });

    it('should have directory operation methods on directory objects', () => {
      [result.dir1, result.dir2, result.dir2.dir1, result.dir2.dir2].forEach(
        (dirObj) => {
          dirOperationMethods.forEach((method) => {
            expect(dirObj).toHaveProperty(method);
            expect(dirObj[method]).toBeInstanceOf(Function);
          });
        },
      );
    });

    it('should have file operation methods on file objects', () => {
      [
        result.file1,
        result.file2,
        result.dir2.file1,
        result.dir2.file2,
      ].forEach((dirObj) => {
        fileOperationMethods.forEach((method) => {
          expect(dirObj).toHaveProperty(method);
          expect(dirObj[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should have file and directory property names from the file tree', () => {
      expect(result).toHaveProperty('file1');
      expect(result).toHaveProperty('file2');
      expect(result).toHaveProperty('dir1');
      expect(result).toHaveProperty('dir2');
      expect(result.dir2).toHaveProperty('file1');
      expect(result.dir2).toHaveProperty('file2');
      expect(result.dir2).toHaveProperty('dir1');
      expect(result.dir2).toHaveProperty('dir2');
      expect(result.dir2.dir2).toHaveProperty('file1');
      expect(result.dir2.dir2).toHaveProperty('file2');
    });

    it('should return correct paths', () => {
      expect(result.$getPath()).toBe(testDirPath);
      expect(result.file1.$getPath()).toBe(joinTestPath('file1'));
      expect(result.file2.$getPath()).toBe(joinTestPath('file2'));
      expect(result.dir1.$getPath()).toBe(joinTestPath('dir1'));
      expect(result.dir2.$getPath()).toBe(joinTestPath('dir2'));
      expect(result.dir2.file1.$getPath()).toBe(joinTestPath('dir2', 'file1'));
      expect(result.dir2.file2.$getPath()).toBe(joinTestPath('dir2', 'file2'));
      expect(result.dir2.dir1.$getPath()).toBe(joinTestPath('dir2', 'dir1'));
      expect(result.dir2.dir2.$getPath()).toBe(joinTestPath('dir2', 'dir2'));
      expect(result.dir2.dir2.file1.$getPath()).toBe(
        joinTestPath('dir2', 'dir2', 'file1'),
      );
      expect(result.dir2.dir2.file2.$getPath()).toBe(
        joinTestPath('dir2', 'dir2', 'file2'),
      );
    });

    it('should check if files and directories from file tree exist', () => {
      const file1 = joinTestPath('file1');
      const file2 = joinTestPath('file2');
      const file3 = joinTestPath('dir2', 'file1');
      const file4 = joinTestPath('dir2', 'file2');
      const file5 = joinTestPath('dir2', 'dir2', 'file1');
      const file6 = joinTestPath('dir2', 'dir2', 'file2');
      const dir1 = joinTestPath('dir1');
      const dir2 = joinTestPath('dir2');
      const dir3 = joinTestPath('dir2', 'dir1');
      const dir4 = joinTestPath('dir2', 'dir2');

      function checkExists(value: boolean): void {
        expect(result.$exists('file1')).toBe(value);
        expect(result.$exists('file2')).toBe(value);
        expect(result.$exists('dir1')).toBe(value);
        expect(result.$exists('dir2')).toBe(value);
        expect(result.dir2.$exists('file1')).toBe(value);
        expect(result.dir2.$exists('file2')).toBe(value);
        expect(result.dir2.$exists('dir1')).toBe(value);
        expect(result.dir2.$exists('dir2')).toBe(value);
        expect(result.dir2.dir2.$exists('file1')).toBe(value);
        expect(result.dir2.dir2.$exists('file2')).toBe(value);
      }

      // expect false before files and directories are created
      checkExists(false);

      // create files and directories from the file tree
      [dir1, dir2, dir3, dir4].forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
      });
      [file1, file2, file3, file4, file5, file6].forEach((file) => {
        fs.writeFileSync(file, '');
      });

      // expect true after files and directories are created
      checkExists(true);
    });

    it('should check if files and directories not from file tree exist', () => {
      const fileName = 'new-file';
      const dirName = 'new-dir';

      const file1 = joinTestPath(fileName);
      const file2 = joinTestPath('dir1', fileName);
      const file3 = joinTestPath('dir2', 'dir1', fileName);
      const dir1 = joinTestPath(dirName);
      const dir2 = joinTestPath('dir1', dirName);
      const dir3 = joinTestPath('dir2', 'dir1', dirName);

      function checkExists(value: boolean): void {
        expect(result.$exists(fileName)).toBe(value);
        expect(result.$exists(dirName)).toBe(value);
        expect(result.dir1.$exists(fileName)).toBe(value);
        expect(result.dir1.$exists(dirName)).toBe(value);
        expect(result.dir2.dir1.$exists(fileName)).toBe(value);
        expect(result.dir2.dir1.$exists(dirName)).toBe(value);
      }

      // expect false before new files and directories are created
      checkExists(false);

      [dir1, dir2, dir3].forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
      });
      [file1, file2, file3].forEach((file) => {
        fs.writeFileSync(file, '');
      });

      // expect true after new files and directories are created
      checkExists(true);
    });

    it('should create directories', () => {
      const dirName = 'new-dir';

      function checkExists(value: boolean): void {
        [
          joinTestPath(dirName),
          joinTestPath('dir1', dirName),
          joinTestPath('dir2', 'dir1', dirName),
        ].forEach((dir) => {
          expect(fs.existsSync(dir)).toBe(value);
        });
      }

      // expect false before directories are created
      checkExists(false);

      // create directories
      result.$dirCreate(dirName);
      result.dir1.$dirCreate(dirName);
      result.dir2.dir1.$dirCreate(dirName);

      // expect true after directories are created
      checkExists(true);
    });

    it('should return directory operations object from dirCreate', () => {
      const dirName = 'new-dir';

      const dir1 = result.$dirCreate(dirName);
      const dir2 = result.dir1.$dirCreate(dirName);
      const dir3 = result.dir2.dir1.$dirCreate(dirName);

      [dir1, dir2, dir3].forEach((dir) => {
        expect(dir).toBeDefined();
        expect(dir).toBeTypeOf('object');

        dirOperationMethods.forEach((method) => {
          expect(dir).toHaveProperty(method);
          expect(dir[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should delete directories from the file tree', () => {
      const dirs = [
        joinTestPath('dir1'),
        joinTestPath('dir2'),
        joinTestPath('dir2', 'dir1'),
        joinTestPath('dir2', 'dir2'),
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

    it('should delete directories that are not from the file tree', () => {
      const dirName = 'new-dir';
      const dirs = [
        joinTestPath(dirName),
        joinTestPath('dir2', dirName),
        joinTestPath('dir2', 'dir2', dirName),
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
      result.$dirDelete(dirName);
      result.dir2.$dirDelete(dirName);
      result.dir2.dir2.$dirDelete(dirName);

      // expect false after deleting directories
      checkExists(false);
    });

    it('should read files from the file tree', () => {
      function getFileData({ data }: FileInterface): string {
        return data instanceof Function ? data() : (data ?? '');
      }

      type File = { path: string; data: string };
      const file1: File = {
        path: joinTestPath('file1'),
        data: getFileData(tree.file1),
      };
      const file2: File = {
        path: joinTestPath('file2'),
        data: getFileData(tree.file2),
      };
      const file3: File = {
        path: joinTestPath('dir2', 'file1'),
        data: getFileData(tree.dir2.children.file1),
      };
      const file4: File = {
        path: joinTestPath('dir2', 'file2'),
        data: getFileData(tree.dir2.children.file2),
      };
      const file5: File = {
        path: joinTestPath('dir2', 'dir2', 'file1'),
        data: getFileData(tree.dir2.children.dir2.children.file1),
      };
      const file6: File = {
        path: joinTestPath('dir2', 'dir2', 'file2'),
        data: getFileData(tree.dir2.children.dir2.children.file2),
      };

      // create files manually to mock FileManager's create method
      fs.mkdirSync(joinTestPath('dir2', 'dir2'), { recursive: true });
      [file1, file2, file3, file4, file5, file6].forEach((file) => {
        fs.writeFileSync(file.path, file.data);
      });

      // read files
      expect(result.$fileRead('file1')).toBe(file1.data);
      expect(result.$fileRead('file2')).toBe(file2.data);
      expect(result.dir2.$fileRead('file1')).toBe(file3.data);
      expect(result.dir2.$fileRead('file2')).toBe(file4.data);
      expect(result.dir2.dir2.$fileRead('file1')).toBe(file5.data);
      expect(result.dir2.dir2.$fileRead('file2')).toBe(file6.data);
    });

    it('should read files that are not from the file tree', () => {
      type File = { path: string; data: string };
      const fileName = 'new-file';

      const file1: File = {
        path: joinTestPath(fileName),
        data: 'New File test',
      };
      const file2: File = {
        path: joinTestPath('dir1', fileName),
        data: 'Dir 1\nNew File test',
      };
      const file3: File = {
        path: joinTestPath('dir2', 'dir1', fileName),
        data: 'Dir 2\nDir 1\nNew File test',
      };

      // create files manually
      fs.mkdirSync(joinTestPath('dir1'));
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });
      [file1, file2, file3].forEach((file) => {
        fs.writeFileSync(file.path, file.data);
      });

      // read files
      expect(result.$fileRead(fileName)).toBe(file1.data);
      expect(result.dir1.$fileRead(fileName)).toBe(file2.data);
      expect(result.dir2.dir1.$fileRead(fileName)).toBe(file3.data);
    });

    it('should read files created with fileCreate', () => {
      const fileName = 'new-file';
      const fileData1 = 'New File test';
      const fileData2 = 'Dir 1\nNew File test';
      const fileData3 = 'Dir 2\nDir 1\nNew File test';

      fs.mkdirSync(joinTestPath('dir1'));
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });

      // create files using fileCreate
      result.$fileCreate(fileName, fileData1);
      result.dir1.$fileCreate(fileName, fileData2);
      result.dir2.dir1.$fileCreate(fileName, fileData3);

      // read files
      expect(result.$fileRead(fileName)).toBe(fileData1);
      expect(result.dir1.$fileRead(fileName)).toBe(fileData2);
      expect(result.dir2.dir1.$fileRead(fileName)).toBe(fileData3);
    });

    it('should read files created with dirCreate and fileCreate', () => {
      const dirName = 'new-dir';
      const fileName = 'new-file';
      const fileData1 = 'New Dir\nNew File test';
      const fileData2 = 'Dir 1\nNew Dir\nNew File test';
      const fileData3 = 'Dir 2\nDir 1\nNew Dir\nNew File test';

      // create directories using dirCreate
      const dir1 = result.$dirCreate(dirName);
      const dir2 = result.dir1.$dirCreate(dirName);
      const dir3 = result.dir2.dir1.$dirCreate(dirName);

      // create files using fileCreate on created directories
      dir1.$fileCreate(fileName, fileData1);
      dir2.$fileCreate(fileName, fileData2);
      dir3.$fileCreate(fileName, fileData3);

      // read files
      expect(dir1.$fileRead(fileName)).toBe(fileData1);
      expect(dir2.$fileRead(fileName)).toBe(fileData2);
      expect(dir3.$fileRead(fileName)).toBe(fileData3);
    });

    it('should create files', () => {
      const fileName = 'new-file';

      function checkExists(value: boolean): void {
        [
          joinTestPath(fileName),
          joinTestPath('dir1', fileName),
          joinTestPath('dir2', 'dir1', fileName),
        ].forEach((file) => {
          expect(fs.existsSync(file)).toBe(value);
        });
      }

      fs.mkdirSync(joinTestPath('dir1'));
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });

      // expect false before files are created
      checkExists(false);

      // create files
      result.$fileCreate(fileName);
      result.dir1.$fileCreate(fileName);
      result.dir2.dir1.$fileCreate(fileName);

      // expect true after files are created
      checkExists(true);
    });

    it('should create a nested file in an existing folder', () => {
      const nestedFileName = 'dir2/dir1/new-file-2';
      const nestedFilePath = joinTestPath(nestedFileName);
      function checkExists(value: boolean): void {
        expect(fs.existsSync(nestedFilePath)).toBe(value);
      }

      // expect false before a nested file is created
      checkExists(false);

      // create a nested file
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });
      result.$fileCreate(nestedFileName);

      // expect true after a nested file is created
      checkExists(true);
    });

    it('should throw when creating a nested file in a non-existing folder', () => {
      expect(() => result.$fileCreate('new-dir/new-file')).toThrow();
    });

    it('should return file operations object from fileCreate', () => {
      const fileName = 'new-file';
      fs.mkdirSync(joinTestPath('dir1'));
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });

      // create files
      const file1 = result.$fileCreate(fileName);
      const file2 = result.dir1.$fileCreate(fileName);
      const file3 = result.dir2.dir1.$fileCreate(fileName);

      // test created file objects
      [file1, file2, file3].forEach((file) => {
        expect(file).toBeDefined();
        expect(file).toBeTypeOf('object');

        fileOperationMethods.forEach((method) => {
          expect(file).toHaveProperty(method);
          expect(file[method]).toBeInstanceOf(Function);
        });
      });
    });

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

    it('should delete files from the file tree', () => {
      const filePaths = [
        joinTestPath('file1'),
        joinTestPath('file2'),
        joinTestPath('dir2', 'file1'),
        joinTestPath('dir2', 'file2'),
        joinTestPath('dir2', 'dir2', 'file1'),
        joinTestPath('dir2', 'dir2', 'file2'),
      ];

      const { checkExists, createFiles } = useFileDelete(filePaths);

      // create files
      fs.mkdirSync(joinTestPath('dir2', 'dir2'), { recursive: true });
      createFiles();

      // expect true before deleting files
      checkExists(true);

      // delete files
      result.$fileDelete('file1');
      result.$fileDelete('file2');
      result.dir2.$fileDelete('file1');
      result.dir2.$fileDelete('file2');
      result.dir2.dir2.$fileDelete('file1');
      result.dir2.dir2.$fileDelete('file2');

      // expect false after deleting files
      checkExists(false);
    });

    it('should delete files that are not from the file tree', () => {
      const fileName = 'new-file';
      const filePaths = [
        joinTestPath(fileName),
        joinTestPath('dir1', fileName),
        joinTestPath('dir2', 'dir1', fileName),
      ];

      const { checkExists, createFiles } = useFileDelete(filePaths);

      // create files
      fs.mkdirSync(joinTestPath('dir1'));
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });
      createFiles();

      // expect true before deleting files
      checkExists(true);

      // delete files
      result.$fileDelete(fileName);
      result.dir1.$fileDelete(fileName);
      result.dir2.dir1.$fileDelete(fileName);

      // expect false after deleting files
      checkExists(false);
    });

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

    it('should write to files from the file tree', () => {
      const fileData = 'Hello, World!';

      const filePaths = [
        joinTestPath('file1'),
        joinTestPath('file2'),
        joinTestPath('dir2', 'file1'),
        joinTestPath('dir2', 'file2'),
        joinTestPath('dir2', 'dir2', 'file1'),
        joinTestPath('dir2', 'dir2', 'file2'),
      ];

      // create files
      const { createFiles, checkFileData } = useFileWrite(filePaths, fileData);
      fs.mkdirSync(joinTestPath('dir2', 'dir2'), { recursive: true });
      createFiles();

      // write data to files
      result.$fileWrite('file1', fileData);
      result.$fileWrite('file2', fileData);
      result.dir2.$fileWrite('file1', fileData);
      result.dir2.$fileWrite('file2', fileData);
      result.dir2.dir2.$fileWrite('file1', fileData);
      result.dir2.dir2.$fileWrite('file2', fileData);

      // test file data
      checkFileData();
    });

    it('should write to files that are not from the file tree', () => {
      const fileData = 'Hello, World!';
      const fileName = 'new-file';

      const filePaths = [
        joinTestPath(fileName),
        joinTestPath('dir1', fileName),
        joinTestPath('dir2', 'dir1', fileName),
      ];

      // create files
      const { createFiles, checkFileData } = useFileWrite(filePaths, fileData);
      fs.mkdirSync(joinTestPath('dir1'), { recursive: true });
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });
      createFiles();

      // write data to files
      result.$fileWrite(fileName, fileData);
      result.dir1.$fileWrite(fileName, fileData);
      result.dir2.dir1.$fileWrite(fileName, fileData);

      // test file data
      checkFileData();
    });

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

    it('should clear files from the file tree', () => {
      const filePaths = [
        joinTestPath('file1'),
        joinTestPath('file2'),
        joinTestPath('dir2', 'file1'),
        joinTestPath('dir2', 'file2'),
        joinTestPath('dir2', 'dir2', 'file1'),
        joinTestPath('dir2', 'dir2', 'file2'),
      ];

      // create files
      const { createFiles, checkFileData } = useFileClear(filePaths);
      fs.mkdirSync(joinTestPath('dir2', 'dir2'), { recursive: true });
      createFiles();

      // clear file data
      result.$fileClear('file1');
      result.$fileClear('file2');
      result.dir2.$fileClear('file1');
      result.dir2.$fileClear('file2');
      result.dir2.dir2.$fileClear('file1');
      result.dir2.dir2.$fileClear('file2');

      // test cleared file data
      checkFileData();
    });

    it('should clear files that are not from the file tree', () => {
      const fileName = 'new-file';
      const filePaths = [
        joinTestPath(fileName),
        joinTestPath('dir1', fileName),
        joinTestPath('dir2', 'dir1', fileName),
      ];

      // create files
      const { createFiles, checkFileData } = useFileClear(filePaths);
      fs.mkdirSync(joinTestPath('dir1'));
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });
      createFiles();

      // clear file data
      result.$fileClear(fileName);
      result.dir1.$fileClear(fileName);
      result.dir2.dir1.$fileClear(fileName);

      // test cleared file data
      checkFileData();
    });
  });

  describe('buildOperationTree function - custom file operations', () => {
    const testName = 'custom-file-operations';
    const testDirPath = joinPath(testName);
    const joinTestPath = getJoinTestPath(testName);

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

    const customFileMethods: (keyof CustomFileOperations)[] = [
      'getFileData',
      'getFilePath',
      'getFileSkip',
      'getFileType',
      'plusOne',
    ];

    let result: FileOperationTreeType<Tree, CustomFileOperations>;

    beforeEach(() => {
      fs.mkdirSync(testDirPath, { recursive: true });
      result = buildOperationTree(testDirPath, tree, {
        file: getFileOperations,
      });
    });

    afterEach(() => {
      fs.rmSync(testDirPath, {
        force: true,
        recursive: true,
      });
    });

    type FileOperations = FileOperationsInterface & CustomFileOperations;
    interface TestResultsInterface {
      path: string;
      data: string | undefined;
    }
    type Callback = (
      file: FileOperations,
      testResults: TestResultsInterface,
    ) => void;

    function useFileCreate(cb: Callback): void {
      const dirName = 'new-dir';
      const fileName = 'new-file';

      fs.mkdirSync(joinTestPath('dir1'));
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });

      const dirs = {
        dir1: result.$dirCreate(dirName),
        dir2: result.dir1.$dirCreate(dirName),
        dir3: result.dir2.dir1.$dirCreate(dirName),
      };

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
            ? joinTestPath(...fileDirs, dirName, fileName)
            : joinTestPath(...fileDirs, fileName);
        };
      }

      const paths = {
        file1: getFilePath(),
        file2: getFilePath('dir1'),
        file3: getFilePath('dir2', 'dir1'),
      };

      cb(files.tree.file1, { path: paths.file1(), data: fileData1 });
      cb(files.tree.file2, { path: paths.file2(), data: fileData2 });
      cb(files.tree.file3, { path: paths.file3(), data: undefined });

      // test files created in directories created with dirCreate
      cb(files.dirCreate.file1, { path: paths.file1(true), data: fileData1 });
      cb(files.dirCreate.file2, { path: paths.file2(true), data: fileData2 });
      cb(files.dirCreate.file3, { path: paths.file3(true), data: undefined });
    }

    it('should be defined', () => {
      expect(result).toBeDefined();
    });

    it('should have custom file operation methods on file objects from the file tree', () => {
      const files = [
        result.file1,
        result.file2,
        result.dir2.file1,
        result.dir2.file2,
        result.dir2.dir2.file1,
        result.dir2.dir2.file2,
      ];

      files.forEach((file) => {
        customFileMethods.forEach((method) => {
          expect(file).toHaveProperty(method);
          expect(file[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should have custom file operation methods on file objects created with fileCreate', () => {
      useFileCreate((file) => {
        customFileMethods.forEach((method) => {
          expect(file).toHaveProperty(method);
          expect(file[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should return the path for files from the file tree', () => {
      const pathValue = {
        file1: joinTestPath('file1'),
        file2: joinTestPath('file2'),
        file3: joinTestPath('dir2', 'file1'),
        file4: joinTestPath('dir2', 'file2'),
        file5: joinTestPath('dir2', 'dir2', 'file1'),
        file6: joinTestPath('dir2', 'dir2', 'file2'),
      };

      expect(result.file1.getFilePath()).toBe(pathValue.file1);
      expect(result.file2.getFilePath()).toBe(pathValue.file2);
      expect(result.dir2.file1.getFilePath()).toBe(pathValue.file3);
      expect(result.dir2.file2.getFilePath()).toBe(pathValue.file4);
      expect(result.dir2.dir2.file1.getFilePath()).toBe(pathValue.file5);
      expect(result.dir2.dir2.file2.getFilePath()).toBe(pathValue.file6);
    });

    it('should return the path for files created with dirCreate and fileCreate', () => {
      useFileCreate((file, { path }) => {
        expect(file.getFilePath()).toBe(path);
      });
    });

    it('should return file data for files from the file tree', () => {
      const dataValue = {
        file1: undefined,
        file2: tree.file2.data,
        file3: undefined,
        file4: tree.dir2.children.file2.data(),
        file5: tree.dir2.children.dir2.children.file1.data,
        file6: tree.dir2.children.dir2.children.file2.data(),
      };

      expect(result.file1.getFileData()).toBe(dataValue.file1);
      expect(result.file2.getFileData()).toBe(dataValue.file2);
      expect(result.dir2.file1.getFileData()).toBe(dataValue.file3);
      expect(result.dir2.file2.getFileData()).toBe(dataValue.file4);
      expect(result.dir2.dir2.file1.getFileData()).toBe(dataValue.file5);
      expect(result.dir2.dir2.file2.getFileData()).toBe(dataValue.file6);
    });

    it('should return file data for files created with dirCreate and fileCreate', () => {
      useFileCreate((file, { data }) => {
        expect(file.getFileData()).toBe(data);
      });
    });

    it('should return file type for files from the file tree', () => {
      expect(result.file1.getFileType()).toBe('file');
      expect(result.file2.getFileType()).toBe('file');
      expect(result.dir2.file1.getFileType()).toBe('file');
      expect(result.dir2.file2.getFileType()).toBe('file');
      expect(result.dir2.dir2.file1.getFileType()).toBe('file');
      expect(result.dir2.dir2.file2.getFileType()).toBe('file');
    });

    it('should return file type for files created with dirCreate and fileCreate', () => {
      useFileCreate((file) => {
        expect(file.getFileType()).toBe('file');
      });
    });

    it('should return skip value for files from the file tree', () => {
      const skipValue = {
        file1: undefined,
        file2: tree.file2.skip,
        file3: undefined,
        file4: tree.dir2.children.file2.skip,
        file5: undefined,
        file6: tree.dir2.children.dir2.children.file2.skip,
      };

      expect(result.file1.getFileSkip()).toBe(skipValue.file1);
      expect(result.file2.getFileSkip()).toBe(skipValue.file2);
      expect(result.dir2.file1.getFileSkip()).toBe(skipValue.file3);
      expect(result.dir2.file2.getFileSkip()).toBe(skipValue.file4);
      expect(result.dir2.dir2.file1.getFileSkip()).toBe(skipValue.file5);
      expect(result.dir2.dir2.file2.getFileSkip()).toBe(skipValue.file6);
    });

    it('should return skip value for files created with dirCreate and fileCreate', () => {
      useFileCreate((file) => {
        expect(file.getFileSkip()).toBe(false);
      });
    });

    it('should add 1 for files from the file tree', () => {
      expect(result.file1.plusOne(1)).toBe(2);
      expect(result.file2.plusOne(1)).toBe(2);
      expect(result.dir2.file1.plusOne(1)).toBe(2);
      expect(result.dir2.file2.plusOne(1)).toBe(2);
      expect(result.dir2.dir2.file1.plusOne(1)).toBe(2);
      expect(result.dir2.dir2.file2.plusOne(1)).toBe(2);
    });

    it('should add 1 for files created with dirCreate and fileCreate', () => {
      useFileCreate((file) => {
        expect(file.plusOne(1)).toBe(2);
      });
    });
  });

  describe('buildOperationTree function - custom directory operations', () => {
    const testName = 'custom-file-operations';
    const testDirPath = joinPath(testName);
    const joinTestPath = getJoinTestPath(testName);

    const getDirOperations = buildDirOperations((dir) => ({
      getDirPath(): string {
        return dir.path;
      },
      getDirType(): 'dir' {
        return dir.type;
      },
      getDirChildren(): string[] {
        return Object.keys(dir.children ?? {});
      },
      plusOne(value: number): number {
        return value + 1;
      },
    }));

    type CustomDirOperations = ReturnType<typeof getDirOperations>;

    const customDirMethods: (keyof CustomDirOperations)[] = [
      'getDirPath',
      'getDirType',
      'getDirChildren',
      'plusOne',
    ];

    let result: FileOperationTreeType<Tree, undefined, CustomDirOperations>;

    beforeEach(() => {
      fs.mkdirSync(testDirPath, { recursive: true });
      result = buildOperationTree(testDirPath, tree, {
        dir: getDirOperations,
      });
    });

    afterEach(() => {
      fs.rmSync(testDirPath, {
        force: true,
        recursive: true,
      });
    });

    type DirOperations = CustomDirOperations &
      DirOperationsInterface<undefined, undefined, CustomDirOperations>;

    type Callback = (dir: DirOperations, path: string) => void;

    function useDirCreate(cb: Callback): void {
      const dirName = 'new-dir';
      const dir1 = result.$dirCreate(dirName);
      const dir2 = result.dir1.$dirCreate(dirName);
      const dir3 = result.dir2.dir1.$dirCreate(dirName);

      cb(dir1, joinTestPath(dirName));
      cb(dir2, joinTestPath('dir1', dirName));
      cb(dir3, joinTestPath('dir2', 'dir1', dirName));
    }

    it('should be defined', () => {
      expect(result).toBeDefined();
    });

    it('should have custom directory operation methods on directory object in the file tree', () => {
      [
        result,
        result.dir1,
        result.dir2,
        result.dir2.dir1,
        result.dir2.dir2,
      ].forEach((dir) => {
        customDirMethods.forEach((method) => {
          expect(dir).toHaveProperty(method);
          expect(dir[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should have custom directory operation methods on directory object created with dirCreate', () => {
      useDirCreate((dir) => {
        customDirMethods.forEach((method) => {
          expect(dir).toHaveProperty(method);
          expect(dir[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should return the path for directories from the file tree', () => {
      const pathValue = {
        dir1: joinTestPath('dir1'),
        dir2: joinTestPath('dir2'),
        dir3: joinTestPath('dir2', 'dir1'),
        dir4: joinTestPath('dir2', 'dir2'),
      };

      expect(result.getDirPath()).toBe(testDirPath);
      expect(result.dir1.getDirPath()).toBe(pathValue.dir1);
      expect(result.dir2.getDirPath()).toBe(pathValue.dir2);
      expect(result.dir2.dir1.getDirPath()).toBe(pathValue.dir3);
      expect(result.dir2.dir2.getDirPath()).toBe(pathValue.dir4);
    });

    it('should return the path for directories created with dirCreate', () => {
      useDirCreate((dir, dirPath) => {
        expect(dir.getDirPath()).toBe(dirPath);
      });
    });

    it('should return directory type for directories from the file tree', () => {
      const dirs = [
        result,
        result.dir1,
        result.dir2,
        result.dir2.dir1,
        result.dir2.dir2,
      ];

      dirs.forEach((dir) => {
        expect(dir.getDirType()).toBe('dir');
      });
    });

    it('should return directory type for directories created with dirCreate', () => {
      useDirCreate((dir) => {
        expect(dir.getDirType()).toBe('dir');
      });
    });

    it('should return directory children keys for directories from the file tree', () => {
      const result1 = result.getDirChildren();
      const result2 = result.dir1.getDirChildren();
      const result3 = result.dir2.getDirChildren();
      const result4 = result.dir2.dir1.getDirChildren();
      const result5 = result.dir2.dir2.getDirChildren();

      expect([...result1].sort()).toEqual(
        ['dir1', 'dir2', 'file1', 'file2'].sort(),
      );
      expect([...result2]).toEqual([]);
      expect([...result3].sort()).toEqual(
        ['dir1', 'dir2', 'file1', 'file2'].sort(),
      );
      expect([...result4]).toEqual([]);
      expect([...result5].sort()).toEqual(['file1', 'file2'].sort());
    });

    it('should return directory children keys for directories created with dirCreate', () => {
      useDirCreate((dir) => {
        expect(dir.getDirChildren()).toEqual([]);
      });
    });

    it('should add 1 for directories from the file tree', () => {
      expect(result.plusOne(1)).toBe(2);
      expect(result.dir1.plusOne(1)).toBe(2);
      expect(result.dir2.plusOne(1)).toBe(2);
      expect(result.dir2.dir1.plusOne(1)).toBe(2);
      expect(result.dir2.dir2.plusOne(1)).toBe(2);
    });

    it('should add 1 for directories created with dirCreate', () => {
      useDirCreate((dir) => {
        expect(dir.plusOne(1)).toBe(2);
      });
    });
  });
});

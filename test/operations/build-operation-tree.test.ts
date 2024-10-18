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

const { setup: setupSuite, joinPath } = testSetup(
  'build-operation-tree',
  import.meta,
);

enum Test {
  CoreProperties = 'core-properties',
  CoreFileOperations = 'core-file-operations',
  CoreDirOperations = 'core-dir-operations',
  CustomFileOperations = 'custom-file-operations',
  CustomDirOperations = 'custom-dir-operations',
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

  const fileOperationsObject = {
    $getPath: expect.any(Function),
    $exists: expect.any(Function),
    $read: expect.any(Function),
    $write: expect.any(Function),
    $clear: expect.any(Function),
  };

  const dirOperationsObject = {
    $getPath: expect.any(Function),
    $exists: expect.any(Function),
    $dirCreate: expect.any(Function),
    $dirDelete: expect.any(Function),
    $fileClear: expect.any(Function),
    $fileCreate: expect.any(Function),
    $fileDelete: expect.any(Function),
    $fileRead: expect.any(Function),
    $fileWrite: expect.any(Function),
  };

  beforeAll(() => {
    return setupSuite();
  });

  type TestDirSetupFn = () => void;
  interface TestSetupInterface {
    testPath: string;
    joinTestPath: (...args: string[]) => string;
    setupTestDir: TestDirSetupFn;
  }

  function useTestSetup(testName: string): TestSetupInterface {
    const testPath = joinPath(testName);
    function joinTestPath(...args: string[]): string {
      return joinPath(testName, ...args);
    }

    function setupTestDir(): void {
      beforeEach(() => {
        fs.mkdirSync(testPath, { recursive: true });
      });

      afterEach(() => {
        fs.rmSync(testPath, { force: true, recursive: true });
      });
    }

    return {
      testPath,
      joinTestPath,
      setupTestDir,
    };
  }

  describe('buildOperationTree function - core properties', () => {
    const { testPath, setupTestDir } = useTestSetup(Test.CoreProperties);
    setupTestDir();

    let result: FileOperationTreeType<Tree>;
    beforeEach(() => {
      result = buildOperationTree(testPath, tree);
    });

    it('should be defined', () => {
      expect(result).toBeDefined();
    });

    it('should have directory operation methods on result object', () => {
      expect(result).toEqual({
        ...dirOperationsObject,
        file1: fileOperationsObject,
        file2: fileOperationsObject,
        dir1: dirOperationsObject,
        dir2: {
          ...dirOperationsObject,
          file1: fileOperationsObject,
          file2: fileOperationsObject,
          dir1: dirOperationsObject,
          dir2: {
            ...dirOperationsObject,
            file1: fileOperationsObject,
            file2: fileOperationsObject,
          },
        },
      });
    });
  });

  describe('buildOperationTree function - core file operations', () => {
    const { testPath, joinTestPath, setupTestDir } = useTestSetup(
      Test.CoreFileOperations,
    );
    setupTestDir();

    let result: FileOperationTreeType<Tree>;
    beforeEach(() => {
      result = buildOperationTree(testPath, tree);
    });

    it('should return correct file paths', () => {
      expect(result.file1.$getPath()).toBe(joinTestPath('file1'));
      expect(result.file2.$getPath()).toBe(joinTestPath('file2'));
      expect(result.dir2.file1.$getPath()).toBe(joinTestPath('dir2', 'file1'));
      expect(result.dir2.file2.$getPath()).toBe(joinTestPath('dir2', 'file2'));
      expect(result.dir2.dir2.file1.$getPath()).toBe(
        joinTestPath('dir2', 'dir2', 'file1'),
      );
      expect(result.dir2.dir2.file2.$getPath()).toBe(
        joinTestPath('dir2', 'dir2', 'file2'),
      );
    });
  });

  describe('buildOperationTree function - core directory operations', () => {
    const { testPath, joinTestPath, setupTestDir } = useTestSetup(
      Test.CoreDirOperations,
    );
    setupTestDir();

    let result: FileOperationTreeType<Tree>;
    beforeEach(() => {
      result = buildOperationTree(testPath, tree);
    });

    it('should return correct directory paths', () => {
      expect(result.$getPath()).toBe(testPath);
      expect(result.dir1.$getPath()).toBe(joinTestPath('dir1'));
      expect(result.dir2.$getPath()).toBe(joinTestPath('dir2'));
      expect(result.dir2.dir1.$getPath()).toBe(joinTestPath('dir2', 'dir1'));
      expect(result.dir2.dir2.$getPath()).toBe(joinTestPath('dir2', 'dir2'));
    });

    it('should check if files and directories from file tree exist', () => {
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
      const dirs = [
        joinTestPath('dir1'),
        joinTestPath('dir2'),
        joinTestPath('dir2', 'dir1'),
        joinTestPath('dir2', 'dir2'),
      ];
      const files = [
        joinTestPath('file1'),
        joinTestPath('file2'),
        joinTestPath('dir2', 'file1'),
        joinTestPath('dir2', 'file2'),
        joinTestPath('dir2', 'dir2', 'file1'),
        joinTestPath('dir2', 'dir2', 'file2'),
      ];

      dirs.forEach((dir) => fs.mkdirSync(dir, { recursive: true }));
      files.forEach((file) => fs.writeFileSync(file, ''));

      // expect true after files and directories are created
      checkExists(true);
    });

    it('should check if files and directories not from file tree exist', () => {
      const fileName = 'new-file';
      const dirName = 'new-dir';

      interface TestItem {
        path: string;
        exists: () => boolean;
      }

      const dirs: TestItem[] = [
        {
          path: joinTestPath(dirName),
          exists: () => result.$exists(dirName),
        },
        {
          path: joinTestPath('dir1', dirName),
          exists: () => result.dir1.$exists(dirName),
        },
        {
          path: joinTestPath('dir2', 'dir1', dirName),
          exists: () => result.dir2.dir1.$exists(dirName),
        },
      ];

      const files: TestItem[] = [
        {
          path: joinTestPath(fileName),
          exists: () => result.$exists(fileName),
        },
        {
          path: joinTestPath('dir1', fileName),
          exists: () => result.dir1.$exists(fileName),
        },
        {
          path: joinTestPath('dir2', 'dir1', fileName),
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

    it('should create directories', () => {
      interface TestItem {
        path: string;
        create: () => void;
      }

      const dirName = 'new-dir';
      const dirs: TestItem[] = [
        {
          path: joinTestPath(dirName),
          create(): void {
            result.$dirCreate(dirName);
          },
        },
        {
          path: joinTestPath('dir1', dirName),
          create(): void {
            result.dir1.$dirCreate(dirName);
          },
        },
        {
          path: joinTestPath('dir2', 'dir1', dirName),
          create(): void {
            result.dir2.dir1.$dirCreate(dirName);
          },
        },
      ];

      function checkExists(value: boolean): void {
        dirs.forEach(({ path: dirPath }) => {
          expect(fs.existsSync(dirPath)).toBe(value);
        });
      }

      // expect false before directories are created
      checkExists(false);

      // create directories
      dirs.forEach(({ create }) => {
        create();
      });

      // expect true after directories are created
      checkExists(true);
    });

    it('should return directory operations object from dirCreate', () => {
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
      interface TestItem {
        path: string;
        delete: () => void;
      }

      const dirName = 'new-dir';
      const dirs: TestItem[] = [
        {
          path: joinTestPath(dirName),
          delete: () => result.$dirDelete(dirName),
        },
        {
          path: joinTestPath('dir1', dirName),
          delete: () => result.dir1.$dirDelete(dirName),
        },
        {
          path: joinTestPath('dir2', dirName),
          delete: () => result.dir2.$dirDelete(dirName),
        },
        {
          path: joinTestPath('dir2', 'dir1', dirName),
          delete: () => result.dir2.dir1.$dirDelete(dirName),
        },
        {
          path: joinTestPath('dir2', 'dir2', dirName),
          delete: () => result.dir2.dir2.$dirDelete(dirName),
        },
      ];

      function checkExists(value: boolean): void {
        dirs.forEach(({ path: dirPath }) => {
          expect(fs.existsSync(dirPath)).toBe(value);
        });
      }

      // create directories manually to mock FileManager's create method
      dirs.forEach(({ path: dirPath }) => {
        fs.mkdirSync(dirPath, { recursive: true });
      });

      // expect true before deleting directories
      checkExists(true);

      // delete directories
      dirs.forEach(({ delete: dirDelete }) => {
        dirDelete();
      });

      // expect false after deleting directories
      checkExists(false);
    });

    it('should read files from the file tree', () => {
      function getFileData({ data }: FileInterface): string {
        return data instanceof Function ? data() : (data ?? '');
      }

      interface TestItem {
        path: string;
        data: string;
        read: () => string | null;
      }

      const files: TestItem[] = [
        {
          path: joinTestPath('file1'),
          data: getFileData(tree.file1),
          read: () => result.$fileRead('file1'),
        },
        {
          path: joinTestPath('file2'),
          data: getFileData(tree.file2),
          read: () => result.$fileRead('file2'),
        },
        {
          path: joinTestPath('dir2', 'file1'),
          data: getFileData(tree.dir2.children.file1),
          read: () => result.dir2.$fileRead('file1'),
        },
        {
          path: joinTestPath('dir2', 'file2'),
          data: getFileData(tree.dir2.children.file2),
          read: () => result.dir2.$fileRead('file2'),
        },
        {
          path: joinTestPath('dir2', 'dir2', 'file1'),
          data: getFileData(tree.dir2.children.dir2.children.file1),
          read: () => result.dir2.dir2.$fileRead('file1'),
        },
        {
          path: joinTestPath('dir2', 'dir2', 'file2'),
          data: getFileData(tree.dir2.children.dir2.children.file2),
          read: () => result.dir2.dir2.$fileRead('file2'),
        },
      ];

      // create files manually to mock FileManager's create method
      fs.mkdirSync(joinTestPath('dir2', 'dir2'), { recursive: true });
      files.forEach(({ path: filePath, data, read }) => {
        fs.writeFileSync(filePath, data);
        expect(read()).toBe(data);
      });
    });

    it('should read files that are not from the file tree', () => {
      interface TestItem {
        path: string;
        data: string;
        read: () => string | null;
      }

      const fileName = 'new-file';
      const files: TestItem[] = [
        {
          path: joinTestPath(fileName),
          data: 'New File test',
          read: () => result.$fileRead(fileName),
        },
        {
          path: joinTestPath('dir1', fileName),
          data: 'Dir 1\nNew File test',
          read: () => result.dir1.$fileRead(fileName),
        },
        {
          path: joinTestPath('dir2', fileName),
          data: 'Dir 2\nNew File test',
          read: () => result.dir2.$fileRead(fileName),
        },
        {
          path: joinTestPath('dir2', 'dir1', fileName),
          data: 'Dir 2\nDir 1\nNew File test',
          read: () => result.dir2.dir1.$fileRead(fileName),
        },
        {
          path: joinTestPath('dir2', 'dir2', fileName),
          data: 'Dir 2\nDir 2\nNew File test',
          read: () => result.dir2.dir2.$fileRead(fileName),
        },
      ];

      // create files manually
      fs.mkdirSync(joinTestPath('dir1'));
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });
      fs.mkdirSync(joinTestPath('dir2', 'dir2'));

      files.forEach(({ path: filePath, read, data }) => {
        fs.writeFileSync(filePath, data);
        expect(read()).toBe(data);
      });
    });

    it('should read files created via fileCreate', () => {
      fs.mkdirSync(joinTestPath('dir1'));
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });
      fs.mkdirSync(joinTestPath('dir2', 'dir2'));

      const dirs = [
        {
          dir: result,
          data: 'New File test',
        },
        {
          dir: result.dir1,
          data: 'Dir 1\nNew File test',
        },
        {
          dir: result.dir2,
          data: 'Dir 2\nNew File test',
        },
        {
          dir: result.dir2.dir1,
          data: 'Dir 2\nDir 1\nNew File test',
        },
        {
          dir: result.dir2.dir2,
          data: 'Dir 2\nDir 2\nNew File test',
        },
      ];

      const fileName = 'new-file';
      dirs.forEach(({ dir, data }) => {
        dir.$fileCreate(fileName, data);
        expect(dir.$fileRead(fileName)).toBe(data);
      });
    });

    it('should read empty string for files created via fileCreate without data', () => {
      fs.mkdirSync(joinTestPath('dir1'));
      fs.mkdirSync(joinTestPath('dir2', 'dir1'), { recursive: true });
      fs.mkdirSync(joinTestPath('dir2', 'dir2'));

      const dirs = [
        result,
        result.dir1,
        result.dir2,
        result.dir2.dir1,
        result.dir2.dir2,
      ];

      const fileName = 'new-file';
      dirs.forEach((dir) => {
        dir.$fileCreate(fileName);
        expect(dir.$fileRead(fileName)).toBe('');
      });
    });

    it('should read files created via dirCreate and fileCreate', () => {
      const dirs = [
        {
          dir: result,
          data: 'New Dir\nNew File test',
        },
        {
          dir: result.dir1,
          data: 'Dir 1\nNew Dir\nNew File test',
        },
        {
          dir: result.dir2,
          data: 'Dir 2\nNew Dir\nNew File test',
        },
        {
          dir: result.dir2.dir1,
          data: 'Dir 2\nDir 1\nNew Dir\nNew File test',
        },
        {
          dir: result.dir2.dir1,
          data: 'Dir 2\nDir 2\nNew Dir\nNew File test',
        },
      ];

      const dirName = 'new-dir';
      const fileName = 'new-file';

      dirs.forEach(({ dir, data }) => {
        const createDir = dir.$dirCreate(dirName);
        createDir.$fileCreate(fileName, data);
        expect(createDir.$fileRead(fileName)).toBe(data);
      });
    });

    it('should read empty string for files created via dirCreate and fileCreate without data', () => {
      const dirs = [
        result,
        result.dir1,
        result.dir2,
        result.dir2.dir1,
        result.dir2.dir2,
      ];

      const dirName = 'new-dir';
      const fileName = 'new-file';

      dirs.forEach((dir) => {
        const createdDir = dir.$dirCreate(dirName);
        createdDir.$fileCreate(fileName);
        expect(createdDir.$fileRead(fileName)).toBe('');
      });
    });

    it('should return null when reading a non-existent file', () => {
      expect(result.$fileRead('non-existent')).toBe(null);
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
      const files = [
        result.$fileCreate(fileName),
        result.dir1.$fileCreate(fileName),
        result.dir2.dir1.$fileCreate(fileName),
      ];

      // test created file objects
      files.forEach((file) => {
        expect(file).toBeDefined();
        expect(file).toEqual(fileOperationsObject);
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
    const { testPath, joinTestPath, setupTestDir } = useTestSetup(
      Test.CustomFileOperations,
    );
    setupTestDir();

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
      result = buildOperationTree(testPath, tree, {
        file: getFileOperations,
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

      // files created with fileCreate
      cb(files.tree.file1, { path: paths.file1(), data: fileData1 });
      cb(files.tree.file2, { path: paths.file2(), data: fileData2 });
      cb(files.tree.file3, { path: paths.file3(), data: undefined });

      // files created with dirCreate and fileCreate
      cb(files.dirCreate.file1, { path: paths.file1(true), data: fileData1 });
      cb(files.dirCreate.file2, { path: paths.file2(true), data: fileData2 });
      cb(files.dirCreate.file3, { path: paths.file3(true), data: undefined });
    }

    it('should be defined', () => {
      expect(result).toBeDefined();
    });

    it('should have custom file operation methods on files from the file tree', () => {
      [
        result.file1,
        result.file2,
        result.dir2.file1,
        result.dir2.file2,
        result.dir2.dir2.file1,
        result.dir2.dir2.file2,
      ].forEach((file) => {
        customFileMethods.forEach((method) => {
          expect(file).toHaveProperty(method);
          expect(file[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should have custom file operation methods on files created with fileCreate', () => {
      useFileCreate((file) => {
        customFileMethods.forEach((method) => {
          expect(file).toHaveProperty(method);
          expect(file[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should return the path for files from the file tree', () => {
      expect(result.file1.getFilePath()).toBe(joinTestPath('file1'));
      expect(result.file2.getFilePath()).toBe(joinTestPath('file2'));
      expect(result.dir2.file1.getFilePath()).toBe(
        joinTestPath('dir2', 'file1'),
      );
      expect(result.dir2.file2.getFilePath()).toBe(
        joinTestPath('dir2', 'file2'),
      );
      expect(result.dir2.dir2.file1.getFilePath()).toBe(
        joinTestPath('dir2', 'dir2', 'file1'),
      );
      expect(result.dir2.dir2.file2.getFilePath()).toBe(
        joinTestPath('dir2', 'dir2', 'file2'),
      );
    });

    it('should return the path for files created with fileCreate', () => {
      useFileCreate((file, { path }) => {
        expect(file.getFilePath()).toBe(path);
      });
    });

    it('should return file data for files from the file tree', () => {
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

    it('should return file data for files created with fileCreate', () => {
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

    it('should return file type for files created with fileCreate', () => {
      useFileCreate((file) => {
        expect(file.getFileType()).toBe('file');
      });
    });

    it('should return skip value for files from the file tree', () => {
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

    it('should return skip value for files created with fileCreate', () => {
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

    it('should add 1 for files created with fileCreate', () => {
      useFileCreate((file) => {
        expect(file.plusOne(1)).toBe(2);
      });
    });
  });

  describe('buildOperationTree function - custom directory operations', () => {
    const { testPath, joinTestPath, setupTestDir } = useTestSetup(
      Test.CustomDirOperations,
    );
    setupTestDir();

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
      result = buildOperationTree(testPath, tree, {
        dir: getDirOperations,
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

    it('should have custom directory operation methods on directories from the file tree', () => {
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

    it('should have custom directory operation methods on directories created with dirCreate', () => {
      useDirCreate((dir) => {
        customDirMethods.forEach((method) => {
          expect(dir).toHaveProperty(method);
          expect(dir[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should return the path for directories from the file tree', () => {
      expect(result.getDirPath()).toBe(testPath);
      expect(result.dir1.getDirPath()).toBe(joinTestPath('dir1'));
      expect(result.dir2.getDirPath()).toBe(joinTestPath('dir2'));
      expect(result.dir2.dir1.getDirPath()).toBe(joinTestPath('dir2', 'dir1'));
      expect(result.dir2.dir2.getDirPath()).toBe(joinTestPath('dir2', 'dir2'));
    });

    it('should return the path for directories created with dirCreate', () => {
      useDirCreate((dir, dirPath) => {
        expect(dir.getDirPath()).toBe(dirPath);
      });
    });

    it('should return directory type for directories from the file tree', () => {
      [
        result,
        result.dir1,
        result.dir2,
        result.dir2.dir1,
        result.dir2.dir2,
      ].forEach((dir) => {
        expect(dir.getDirType()).toBe('dir');
      });
    });

    it('should return directory type for directories created with dirCreate', () => {
      useDirCreate((dir) => {
        expect(dir.getDirType()).toBe('dir');
      });
    });

    it('should return directory children keys for directories from the file tree', () => {
      function sort(array: string[]): string[] {
        return array.concat().sort();
      }

      expect(sort(result.getDirChildren())).toEqual(
        sort(['dir1', 'dir2', 'file1', 'file2']),
      );
      expect(result.dir1.getDirChildren()).toEqual([]);
      expect(sort(result.dir2.getDirChildren())).toEqual(
        sort(['dir1', 'dir2', 'file1', 'file2']),
      );
      expect(result.dir2.dir1.getDirChildren()).toEqual([]);
      expect(sort(result.dir2.dir2.getDirChildren())).toEqual(
        sort(['file1', 'file2']),
      );
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

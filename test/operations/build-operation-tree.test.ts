import fs from 'node:fs';
import path from 'node:path';
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
import type { FileOperationTreeType } from '../../src/operations/operation.types.js';
import type { FileTreeInterface } from '../../src/file-tree/file-tree.types.js';
import { buildOperationTree } from '../../src/operations/build-operation-tree.js';
import {
  buildDirOperations,
  buildFileOperations,
} from '../../src/operations/build-operations.js';
import { dirOperationMethods, fileOperationMethods } from './constants.js';

const { setup, joinPath } = testSetup('build-operation-tree', import.meta);

suite('buildOperationTree Suite', { concurrent: false }, () => {
  const tree = {
    file1: { type: 'file' },
    file2: { type: 'file' },
    dir1: { type: 'dir' },
    dir2: {
      type: 'dir',
      children: {
        file1: { type: 'file' },
        file2: { type: 'file' },
        dir1: { type: 'dir' },
        dir2: {
          type: 'dir',
          children: {
            file1: { type: 'file' },
            file2: { type: 'file' },
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
    const testDirPath = joinPath('core-methods');
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

    it('should have file tree properties', () => {
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

    it('should return the correct path', () => {
      expect(result.$getPath()).toBe(testDirPath);
    });

    it('should check if file/directory exists', () => {
      const newFile = path.join(testDirPath, 'newFile');
      const newDir = path.join(testDirPath, 'newDir');

      expect(result.$exists('newFile')).toBe(false);
      expect(result.$exists('newDir')).toBe(false);

      fs.writeFileSync(newFile, '');
      fs.mkdirSync(newDir);

      expect(result.$exists('newFile')).toBe(true);
      expect(result.$exists('newDir')).toBe(true);
    });

    it('should create a directory', () => {
      const dir1 = path.join(testDirPath, 'dir1');
      expect(fs.existsSync(dir1)).toBe(false);
      result.$dirCreate('dir1');
      expect(fs.existsSync(dir1)).toBe(true);
    });

    it('should return directory operations object', () => {
      const createdDir = result.$dirCreate('dir1');
      expect(createdDir).toBeDefined();
      expect(createdDir).toBeTypeOf('object');

      dirOperationMethods.forEach((method) => {
        expect(createdDir).toHaveProperty(method);
        expect(createdDir[method]).toBeInstanceOf(Function);
      });
    });

    it('should delete a directory', () => {
      const dir1 = path.join(testDirPath, 'dir1');
      fs.mkdirSync(dir1);
      expect(fs.existsSync(dir1)).toBe(true);
      result.$dirDelete('dir1');
      expect(fs.existsSync(dir1)).toBe(false);
    });

    it('should read a file', () => {
      const file1 = path.join(testDirPath, 'file1');
      const fileData = 'Hello, World!';
      fs.writeFileSync(file1, fileData);
      expect(result.$fileRead('file1')).toBe(fileData);
    });

    it('should create a file', () => {
      const file1 = path.join(testDirPath, 'file1');
      expect(fs.existsSync(file1)).toBe(false);
      result.$fileCreate('file1');
      expect(fs.existsSync(file1)).toBe(true);

      const dir1 = path.join(testDirPath, 'dir1');
      const file2 = path.join(dir1, 'file2');
      fs.mkdirSync(dir1);
      expect(fs.existsSync(file2)).toBe(false);
      result.$fileCreate(file2);
      expect(fs.existsSync(file2)).toBe(true);

      const dir2 = path.join(dir1, 'dir2');
      const file3 = path.join(dir2, 'file3');
      fs.mkdirSync(dir2);
      expect(fs.existsSync(file3)).toBe(false);
      result.$fileCreate(file3);
      expect(fs.existsSync(file3)).toBe(true);
    });

    it('should return file operations object', () => {
      const file1 = result.$fileCreate('file1');
      expect(file1).toBeDefined();
      expect(file1).toBeTypeOf('object');

      fileOperationMethods.forEach((method) => {
        expect(file1).toHaveProperty(method);
        expect(file1[method]).toBeInstanceOf(Function);
      });

      const dir1 = path.join(testDirPath, 'dir1');
      fs.mkdirSync(dir1);
      const file2 = result.dir1.$fileCreate('file2');
      expect(file2).toBeDefined();
      expect(file2).toBeTypeOf('object');

      fileOperationMethods.forEach((method) => {
        expect(file2).toHaveProperty(method);
        expect(file2[method]).toBeInstanceOf(Function);
      });

      const dir2 = path.join(testDirPath, 'dir2', 'dir1');
      fs.mkdirSync(dir2, { recursive: true });
      const file3 = result.dir2.dir1.$fileCreate('file3');
      expect(file3).toBeDefined();
      expect(file3).toBeTypeOf('object');

      fileOperationMethods.forEach((method) => {
        expect(file3).toHaveProperty(method);
        expect(file3[method]).toBeInstanceOf(Function);
      });
    });

    it('should delete a file', () => {
      const file1 = path.join(testDirPath, 'file1');
      fs.writeFileSync(file1, '');
      expect(fs.existsSync(file1)).toBe(true);
      result.$fileDelete('file1');
      expect(fs.existsSync(file1)).toBe(false);
    });

    it('should write to a file', () => {
      const file1 = path.join(testDirPath, 'file1');
      fs.writeFileSync(file1, '');
      expect(fs.readFileSync(file1, { encoding: 'utf-8' })).toBe('');
      const fileData = 'Hello, World!';
      result.$fileWrite('file1', fileData);
      expect(fs.readFileSync(file1, { encoding: 'utf-8' })).toBe(fileData);
    });

    it('should clear the file data', () => {
      const file1 = path.join(testDirPath, 'file1');
      const fileData = 'Hello, World!';
      fs.writeFileSync(file1, fileData);
      expect(fs.readFileSync(file1, { encoding: 'utf-8' })).toBe(fileData);
      result.$fileClear('file1');
      expect(fs.readFileSync(file1, { encoding: 'utf-8' })).toBe('');
    });
  });

  describe('buildOperationTree - custom file operations', () => {
    const testDirPath = joinPath('custom-operations');

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

    it('should have correct custom file operation methods', () => {
      [
        result.file1,
        result.file2,
        result.dir2.file1,
        result.dir2.file2,
      ].forEach((file) => {
        customFileMethods.forEach((method) => {
          expect(file).toHaveProperty(method);
          expect(file[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should create a file with custom file operations', () => {
      // create directories manually
      fs.mkdirSync(path.join(testDirPath, 'dir1'));
      fs.mkdirSync(path.join(testDirPath, 'dir2', 'dir1'), { recursive: true });

      const file1 = result.$fileCreate('new-file');
      const file2 = result.dir1.$fileCreate('new-file');
      const file3 = result.dir2.dir1.$fileCreate('new-file');

      [file1, file2, file3].forEach((file) => {
        customFileMethods.forEach((method) => {
          expect(file).toHaveProperty(method);
          expect(file[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should return file path', () => {
      // create directories manually
      const dir1 = path.join(testDirPath, 'dir1');
      const dir2 = path.join(testDirPath, 'dir2', 'dir1');
      fs.mkdirSync(dir1);
      fs.mkdirSync(dir2, { recursive: true });

      const file1 = result.$fileCreate('new-file');
      const file2 = result.dir1.$fileCreate('new-file');
      const file3 = result.dir2.dir1.$fileCreate('new-file');

      expect(file1.getFilePath()).toBe(path.join(testDirPath, 'new-file'));
      expect(file2.getFilePath()).toBe(path.join(dir1, 'new-file'));
      expect(file3.getFilePath()).toBe(path.join(dir2, 'new-file'));
    });

    it('should return file data', () => {
      //
    });

    it('should return file type', () => {
      //
    });

    it('should return skip value', () => {
      //
    });

    it('should add 1', () => {
      //
    });
  });

  describe('buildOperationTree - custom directory operations', () => {
    const testDirPath = joinPath('custom-operations');

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

    it('should have correct custom directory operation methods', () => {
      [
        result,
        result.dir1,
        result.dir2,
        result.dir2.dir1,
        result.dir2.dir2,
      ].forEach((directory) => {
        customDirMethods.forEach((method) => {
          expect(directory).toHaveProperty(method);
          expect(directory[method]).toBeInstanceOf(Function);
        });
      });
    });

    it('should create a directory with custom directory operations', () => {
      // TODO: create multiple nested directories to test
      const dir = result.$dirCreate('new-dir');

      customDirMethods.forEach((method) => {
        expect(dir).toHaveProperty(method);
        expect(dir[method]).toBeInstanceOf(Function);
      });
    });
  });
});

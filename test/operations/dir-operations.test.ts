import fs from 'node:fs';
import path from 'node:path';
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
} from 'vitest';
import type { DirOperationsInterface } from '../../src/operations/operation.types.js';
import type {
  DirInterface,
  DirWithPathType,
} from '../../src/file-tree/file-tree.types.js';
import { dirOperations } from '../../src/operations/dir-operations.js';
import { buildFileOperations } from '../../src/operations/build-operations.js';
import { setupTest } from './setup-test.js';
import { dirOperationMethods, fileOperationMethods } from './constants.js';

const { testRoot, handleCreateDir, handleDeleteDir } =
  setupTest('dir-operations');

const dir = {
  type: 'dir',
  children: {
    file1: {
      type: 'file',
      data: 'Hello, World!',
    },
    dir1: {
      type: 'dir',
    },
  },
} satisfies DirInterface;
const dirPath = path.join(testRoot, 'dir1');
const dirWithPath: DirWithPathType<typeof dir> = {
  ...dir,
  path: dirPath,
};

beforeAll(() => {
  handleCreateDir();
});

afterAll(() => {
  handleDeleteDir();
});

describe('dirOperations function', () => {
  let result: DirOperationsInterface<typeof dir.children, undefined>;

  beforeEach(() => {
    fs.mkdirSync(dirPath);
    result = dirOperations(dirWithPath);
  });

  afterEach(() => {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true,
    });
  });

  it('should have correct properties', () => {
    dirOperationMethods.forEach((method) => {
      expect(result).toHaveProperty(method);
      expect(result[method]).toBeTypeOf('function');
    });
  });

  it('should return the correct path', () => {
    expect(result.$getPath()).toBe(dirPath);
  });

  it('should check if file/directory exists', () => {
    const file1 = path.join(dirPath, 'file1');
    const dir1 = path.join(dirPath, 'dir1');
    const newFile = path.join(dirPath, 'newFile');
    const newDir = path.join(dirPath, 'newDir');

    fs.writeFileSync(file1, '');
    fs.mkdirSync(dir1);

    expect(result.$exists('file1')).toBe(true);
    expect(result.$exists('dir1')).toBe(true);
    expect(result.$exists('newFile')).toBe(false);
    expect(result.$exists('newDir')).toBe(false);

    fs.writeFileSync(newFile, '');
    fs.mkdirSync(newDir);

    expect(result.$exists('newFile')).toBe(true);
    expect(result.$exists('newDir')).toBe(true);
  });

  it('should create a directory', () => {
    const dir1 = path.join(dirPath, 'dir1');
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
      expect(createdDir[method]).toBeTypeOf('function');
    });
  });

  it('should delete a directory', () => {
    const dir1 = path.join(dirPath, 'dir1');
    fs.mkdirSync(dir1);
    expect(fs.existsSync(dir1)).toBe(true);
    result.$dirDelete('dir1');
    expect(fs.existsSync(dir1)).toBe(false);
  });

  it('should read a file', () => {
    const file1 = path.join(dirPath, 'file1');
    const fileData = dir.children.file1.data;
    fs.writeFileSync(file1, fileData);
    expect(result.$fileRead('file1')).toBe(fileData);
  });

  it('should create a file', () => {
    const file1 = path.join(dirPath, 'file1');
    expect(fs.existsSync(file1)).toBe(false);
    result.$fileCreate('file1');
    expect(fs.existsSync(file1)).toBe(true);
  });

  it('should return file operations object', () => {
    const createdFile = result.$fileCreate('file1');
    expect(createdFile).toBeDefined();
    expect(createdFile).toBeTypeOf('object');

    fileOperationMethods.forEach((method) => {
      expect(createdFile).toHaveProperty(method);
      expect(createdFile[method]).toBeTypeOf('function');
    });
  });

  it('should return file operations object with custom operations', () => {
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

    const resultCustom = dirOperations(dirWithPath, {
      file: getFileOperations,
    });

    const fileData = 'Hello, World!';
    const createdFile = resultCustom.$fileCreate('file1', fileData);

    expect(createdFile).toBeDefined();
    expect(createdFile).toBeTypeOf('object');

    fileOperationMethods.forEach((method) => {
      expect(createdFile).toHaveProperty(method);
      expect(createdFile[method]).toBeTypeOf('function');
    });

    expect(createdFile).toHaveProperty('getFilePath');
    expect(createdFile.getFilePath).toBeTypeOf('function');
    expect(createdFile.getFilePath()).toBe(path.join(dirPath, 'file1'));

    expect(createdFile).toHaveProperty('getFileData');
    expect(createdFile.getFileData).toBeTypeOf('function');
    expect(createdFile.getFileData()).toBe(fileData);

    expect(createdFile).toHaveProperty('getFileType');
    expect(createdFile.getFileType).toBeTypeOf('function');
    expect(createdFile.getFileType()).toBe('file');

    expect(createdFile).toHaveProperty('getFileSkip');
    expect(createdFile.getFileSkip).toBeTypeOf('function');
    expect(createdFile.getFileSkip()).toBe(false);

    expect(createdFile).toHaveProperty('plusOne');
    expect(createdFile.plusOne).toBeTypeOf('function');
    expect(createdFile.plusOne(1)).toBe(2);
  });

  it('should delete a file', () => {
    const file1 = path.join(dirPath, 'file1');
    fs.writeFileSync(file1, '');
    expect(fs.existsSync(file1)).toBe(true);
    result.$fileDelete('file1');
    expect(fs.existsSync(file1)).toBe(false);
  });

  it('should write to a file', () => {
    const file1 = path.join(dirPath, 'file1');
    fs.writeFileSync(file1, '');
    expect(fs.readFileSync(file1, { encoding: 'utf-8' })).toBe('');
    const fileData = 'Hello, World!';
    result.$fileWrite('file1', fileData);
    expect(fs.readFileSync(file1, { encoding: 'utf-8' })).toBe(fileData);
  });

  it('should clear the file data', () => {
    const file1 = path.join(dirPath, 'file1');
    const fileData = dir.children.file1.data;
    fs.writeFileSync(file1, fileData);
    expect(fs.readFileSync(file1, { encoding: 'utf-8' })).toBe(fileData);
    result.$fileClear('file1');
    expect(fs.readFileSync(file1, { encoding: 'utf-8' })).toBe('');
  });
});

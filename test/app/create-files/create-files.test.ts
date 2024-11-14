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
import { createFiles } from '@app/create-files/create-files.js';
import { CreateFileError } from '@app/errors/create-file.error.js';
import { buildOperations } from '@app/operations/build-operations.js';
import {
  isDirOperations,
  isFileOperations,
} from '@app/operations/utils/is-operations.js';
import type { FileTreeInterface, DirOperationsType } from '@app-types';
import { testSetup } from '@test-setup';
import { deleteDir } from '@test-utils/delete-dir.js';
import { getPathArray, type PathTreeFile } from '@test-utils/get-path-array.js';
import { tree } from '@test-utils/tree.js';

const { setup, joinPath } = testSetup('create-files', import.meta);

enum CreateFilesTest {
  OperationsObject = 'operations-object',
  ErrorHandling = 'error-handling',
}

suite('createFiles function', { concurrent: false }, () => {
  beforeAll(() => setup());

  let getDescribePath: (...args: string[]) => string;

  function describeSetup(testName: string): void {
    getDescribePath = (...args) => joinPath(testName, ...args);
  }

  describe('create files based on an operations object', () => {
    describeSetup(CreateFilesTest.OperationsObject);
    const describePath = getDescribePath();
    const pathArray = getPathArray(tree, describePath);

    beforeEach(() => {
      const operations = buildOperations(describePath, tree);
      createFiles(operations);
    });

    afterEach(() => {
      const files = fs.readdirSync(describePath);
      files.forEach((file) => {
        deleteDir(getDescribePath(file));
      });
    });

    it('should create files and directories', () => {
      pathArray.forEach((item) => {
        expect(fs.existsSync(item.path)).toBe(true);
      });
    });

    it('should be directories', () => {
      pathArray
        .filter(({ type }) => type === 'dir')
        .forEach((dir) => {
          expect(fs.statSync(dir.path).isDirectory()).toBe(true);
        });
    });

    it('should be files', () => {
      pathArray
        .filter(({ type }) => type === 'file')
        .forEach((file) => {
          expect(fs.statSync(file.path).isFile()).toBe(true);
        });
    });

    it('should write correct file data', () => {
      pathArray
        .filter((item): item is PathTreeFile => item.type === 'file')
        .forEach((file) => {
          const data = fs.readFileSync(file.path, { encoding: 'utf-8' });
          expect(data).toBe(file.data);
        });
    });
  });

  describe('create files error handling', () => {
    describeSetup(CreateFilesTest.ErrorHandling);
    const describePath = getDescribePath();
    const rootPath = getDescribePath('root-path');
    let operations: DirOperationsType<FileTreeInterface>;

    beforeEach(() => {
      operations = buildOperations(rootPath, tree);
      fs.mkdirSync(describePath, { recursive: true });
    });

    afterEach(() => {
      const files = fs.readdirSync(describePath);
      files.forEach((file) => {
        deleteDir(getDescribePath(file));
      });
    });

    it('should return error when root directory path is a file', () => {
      fs.writeFileSync(rootPath, '');

      const errors = createFiles(operations);
      expect(errors.length).toBe(1);
      expect(errors.at(0)).toBeInstanceOf(CreateFileError);
      expect(errors.at(0)?.type).toBe('dir');
      expect(errors.at(0)?.path).toBe(rootPath);
    });

    it('should return errors when file paths exist as directories', () => {
      const filePaths: string[] = [];

      function traverse(dir: DirOperationsType<any>): void {
        Object.values(dir).forEach((node) => {
          if (typeof node === 'object') {
            if (isFileOperations(node)) {
              const filePath = node.$getPath();
              filePaths.push(filePath);
              fs.mkdirSync(filePath, { recursive: true });
              return;
            }

            if (isDirOperations(node)) {
              traverse(node);
            }
          }
        });
      }

      traverse(operations);

      const errors = createFiles(operations);

      expect(errors.length).toBe(filePaths.length);
      filePaths.forEach((filePath, i) => {
        expect(errors.at(i)).toBeInstanceOf(CreateFileError);
        expect(errors.at(i)?.type).toBe('file');
        expect(errors.at(i)?.path).toBe(filePath);
      });
    });

    it('should return errors when directory paths exist as files', () => {
      const dirPaths: string[] = [];

      function traverse(dir: DirOperationsType<any>): void {
        console.log(dir.$getPath());
        fs.mkdirSync(dir.$getPath(), { recursive: true });

        Object.values(dir).forEach((node) => {
          if (typeof node === 'object' && isDirOperations(node)) {
            const dirPath = node.$getPath();
            dirPaths.push(dirPath);
            fs.writeFileSync(dirPath, '');
          }
        });
      }

      traverse(operations);

      const errors = createFiles(operations);

      expect(errors.length).toBe(dirPaths.length);
      dirPaths.forEach((dirPath, i) => {
        expect(errors.at(i)).toBeInstanceOf(CreateFileError);
        expect(errors.at(i)?.type).toBe('dir');
        expect(errors.at(i)?.path).toBe(dirPath);
      });
    });
  });
});

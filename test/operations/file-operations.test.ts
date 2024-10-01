import fs from 'node:fs';
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  suite,
} from 'vitest';
import type {
  FileInterface,
  FileWithPathType,
} from '../../src/file-tree/file-tree.types.js';
import { fileOperations } from '../../src/operations/file-operations.js';
import type { FileOperationsInterface } from '../../src/operations/operation.types.js';
import { testSetup } from '../test-setup.js';
import { fileOperationMethods } from './constants.js';

const { setup, joinPath } = testSetup('file-operations', import.meta);

const file = {
  type: 'file',
  data: 'Hello, World!',
} satisfies FileInterface;
const filePath = joinPath('test-file');
const fileWithPath: FileWithPathType<typeof file> = {
  ...file,
  path: filePath,
};

suite('fileOperations Suite', { sequential: true }, () => {
  beforeAll(() => {
    return setup();
  });

  describe('fileOperations function', () => {
    let result: FileOperationsInterface;

    beforeEach(() => {
      fs.writeFileSync(filePath, file.data);
      result = fileOperations(fileWithPath);
    });

    afterEach(() => {
      fs.rmSync(filePath);
    });

    it('should have correct properties', () => {
      fileOperationMethods.forEach((operation) => {
        expect(result).toHaveProperty(operation);
        expect(result[operation]).toBeTypeOf('function');
      });
    });

    it('should return the correct path', () => {
      expect(result.$getPath()).toBe(filePath);
    });

    it('should check if file exists', () => {
      expect(result.$exists()).toBe(true);
    });

    it('should read the file data', () => {
      expect(result.$read()).toBe(file.data);

      // reading file where data is a function
      const file2 = {
        type: 'file',
        data: (): string => 'Hello, World!\nNext line!',
      } satisfies FileInterface;
      const filePath2 = joinPath('test-file2');
      const fileWithPath2: FileWithPathType<typeof file> = {
        ...file,
        path: filePath2,
      };
      const result2 = fileOperations(fileWithPath2);
      fs.writeFileSync(filePath2, file2.data());
      expect(result2.$read()).toBe(file2.data());
    });

    it('should write to the file', () => {
      result.$write('Overridden!');
      expect(fs.readFileSync(filePath, { encoding: 'utf-8' })).toBe(
        'Overridden!',
      );
    });

    it('should clear the file data', () => {
      result.$clear();
      expect(fs.readFileSync(filePath, { encoding: 'utf-8' })).toBe('');
    });
  });
});

import { vi, beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import type { FileTreeInterface } from '../../src/types/file-tree.types.js';
import type {
  ExtensionsInterface,
  DirOperationsFn,
  FileOperationsFn,
} from '../../src/types/operation.types.js';
import { FileManager } from '../../src/file-manager.js';
import { buildOperations } from '../../src/operations/build-operations.js';
import { testSetup } from '../test-setup.js';

vi.mock('../../src/operations/build-operations.js', { spy: true });

const { setup, joinPath } = testSetup('file-manager', import.meta);

function expectObject(tree: object): object {
  let result: object = {};

  Object.entries(tree).forEach(([key, value]) => {
    if (value instanceof Function) {
      result = {
        ...result,
        [key]: expect.any(Function),
      };
      return;
    }

    if (typeof value === 'object') {
      result = {
        ...result,
        [key]: expectObject(value),
      };
      return;
    }

    result = {
      ...result,
      [key]: value,
    };
  });

  return result;
}

enum Test {
  Mount = 'mount',
}

suite('FileManager class', () => {
  beforeAll(() => {
    return setup();
  });

  function describeTest(testName: string): (...args: string[]) => string {
    return function getDescribePath(...args) {
      return joinPath(testName, ...args);
    };
  }

  function useTree(cb: (testTree?: FileTreeInterface) => void): void {
    const tree = FileManager.tree({
      file1: 'File 1 Test',
      file2: 'File 2 Test',
      dir1: {},
      dir2: {
        file1: 'Dir 2\nFile 1 Test',
        file2: 'Dir 2\nFile 2 Test',
        dir1: {},
        dir2: {
          file1: 'Dir 2\nDir 2\nFile 1 Test',
          file2: 'Dir 2\nDir 2\nFile 2 Test',
        },
      },
    });

    cb(tree);
  }

  function useExtensions(cb: (extensions?: ExtensionsInterface) => void): void {
    const fileOperations: FileOperationsFn = (file) => ({
      $getFileData: (): string => file.data,
      $getFilePath: (): string => file.path,
    });

    const dirOperations: DirOperationsFn = (dir) => ({
      $getDirPath: (): string => dir.path,
      $getDirChildren: (): string[] => Object.keys(dir.children),
    });

    const withFile = { fileOperations };
    const withDir = { dirOperations };
    const extraOperations = [
      undefined,
      {},
      withFile,
      withDir,
      { ...withFile, ...withDir },
    ] as const;

    extraOperations.forEach((extensions) => {
      cb(extensions);
    });
  }

  describe('file manager instance', () => {
    let fileManager: FileManager;

    beforeEach(() => {
      fileManager = new FileManager();
    });

    it('should be an instance of FileManager', () => {
      expect(fileManager).toBeDefined();
      expect(fileManager).toBeInstanceOf(FileManager);
    });
  });

  describe('mount method', () => {
    const getDescribePath = describeTest(Test.Mount);
    const describePath = getDescribePath();

    it('should return an operations object', () => {
      useTree((tree) => {
        useExtensions((extensions) => {
          const fileManager = new FileManager(extensions);
          const result = fileManager.mount(describePath, tree);
          const operationTree = buildOperations(describePath, tree, extensions);

          expect(result).toEqual(expectObject(operationTree));
        });
      });
    });

    it('should call buildOperations', () => {
      useTree((tree) => {
        useExtensions((extensions) => {
          const fileManager = new FileManager(extensions);
          fileManager.mount(describePath, tree);

          expect(buildOperations).toHaveBeenCalledWith(
            describePath,
            tree,
            extensions,
          );
        });
      });
    });
  });

  describe('tree static method', () => {
    it('should return a tree object', () => {
      const tree: FileTreeInterface = {};
      expect(FileManager.tree(tree)).toBe(tree);
    });
  });

  describe('extend static method', () => {
    it('should return an extensions object', () => {
      const extensions: ExtensionsInterface = {};
      expect(FileManager.extend(extensions)).toBe(extensions);
    });
  });
});

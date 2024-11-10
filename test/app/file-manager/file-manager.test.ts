import { vi, beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { FileManager } from '../../../src/file-manager.js';
import { buildOperations } from '../../../src/operations/build-operations.js';
import type { FileTreeInterface } from '../../../src/types/file-tree.types.js';
import type {
  ExtensionsInterface,
  DirOperationsFn,
  FileOperationsFn,
} from '../../../src/types/operation.types.js';
import { testSetup } from '../../test-setup.js';
import { tree } from '../../tree.js';
import { anyFunction } from '../../utils.js';

vi.mock('../../../src/operations/build-operations.js', { spy: true });

const { setup, joinPath } = testSetup('file-manager', import.meta);

enum Test {
  Mount = 'mount',
}

suite('FileManager class', () => {
  beforeAll(() => setup());

  function describeTest(testName: string): (...args: string[]) => string {
    return function getDescribePath(...args) {
      return joinPath(testName, ...args);
    };
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
      useExtensions((extensions) => {
        const fileManager = new FileManager(extensions);
        const result = fileManager.mount(describePath, tree);
        const operationTree = buildOperations(describePath, tree, extensions);

        // TODO: see if anyFunction is needed
        expect(result).toEqual(anyFunction(operationTree));
      });
    });

    it('should call buildOperations', () => {
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

  describe('tree static method', () => {
    it('should return a tree object', () => {
      const testTree: FileTreeInterface = {};
      expect(FileManager.tree(testTree)).toBe(testTree);
    });
  });

  describe('extend static method', () => {
    it('should return an extensions object', () => {
      const extensions: ExtensionsInterface = {};
      expect(FileManager.extend(extensions)).toBe(extensions);
    });
  });
});

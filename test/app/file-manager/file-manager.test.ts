import { vi, beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';
import { createFiles } from '../../../src/create-files/create-files.js';
import { FileManager, type CreateFilesFn } from '../../../src/file-manager.js';
import { buildOperations } from '../../../src/operations/build-operations.js';
import type { FileTreeInterface } from '../../../src/types/file-tree.types.js';
import type {
  DirOperationsType,
  ExtraOperationsInterface,
} from '../../../src/types/operation.types.js';
import { anyFunction } from '../../any-function.js';
import {
  extraDirOperations,
  extraFileOperations,
  type ExtraDirOperations,
  type ExtraFileOperations,
} from '../../extra-operations.js';
import { testSetup } from '../../test-setup.js';
import { tree } from '../../tree.js';

vi.mock('../../../src/operations/build-operations.js', { spy: true });
vi.mock('../../../src/create-files/create-files.js', { spy: true });

const { setup, joinPath } = testSetup('file-manager', import.meta);

enum FileManagerTest {
  Operations = 'operations',
  CreateFiles = 'createFiles',
}

suite('FileManager class', () => {
  beforeAll(() => setup());

  let getDescribePath: (...args: string[]) => string;

  function describeSetup(testName: string): void {
    beforeEach(() => {
      getDescribePath = (...args) => joinPath(testName, ...args);
    });
  }

  function useExtraOperations(
    cb: (
      extraOperations?: ExtraOperationsInterface<
        ExtraFileOperations | undefined,
        ExtraDirOperations | undefined
      >,
    ) => void,
  ): void {
    const withFile: ExtraOperationsInterface<ExtraFileOperations, undefined> = {
      file: extraFileOperations,
    };
    const withDir: ExtraOperationsInterface<undefined, ExtraDirOperations> = {
      dir: extraDirOperations,
    };
    const extraOperationsArray = [
      undefined,
      {},
      withFile,
      withDir,
      { ...withFile, ...withDir },
    ] as const;

    extraOperationsArray.forEach((extraOperations) => {
      cb(extraOperations);
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

  describe('operations object', () => {
    describeSetup(FileManagerTest.Operations);

    it('should return an operations object', () => {
      const describePath = getDescribePath();

      useExtraOperations((extraOperations) => {
        const fileManager = new FileManager(extraOperations);
        const [result] = fileManager.mount(describePath, tree);
        const operationTree = buildOperations(
          describePath,
          tree,
          extraOperations,
        );

        expect(result).toEqual(anyFunction(operationTree));
      });
    });

    it('should call buildOperations', () => {
      const describePath = getDescribePath();

      useExtraOperations((extraOperations) => {
        const fileManager = new FileManager(extraOperations);
        fileManager.mount(describePath, tree);

        expect(buildOperations).toHaveBeenCalledWith(
          describePath,
          tree,
          extraOperations,
        );
      });
    });
  });

  describe('function to create files', () => {
    describeSetup(FileManagerTest.CreateFiles);

    let operations: DirOperationsType<typeof tree>;
    let createFilesFn: CreateFilesFn;

    beforeEach(() => {
      const describePath = getDescribePath();
      const fileManager = new FileManager();
      [operations, createFilesFn] = fileManager.mount(describePath, tree);
    });

    it('should return a function to create files', () => {
      expect(createFilesFn).toBeTypeOf('function');
    });

    it('should call createFiles function', () => {
      createFilesFn();
      expect(createFiles).toHaveBeenCalledWith(operations);
    });
  });

  describe('tree static method', () => {
    it('should return a tree object', () => {
      const testTree: FileTreeInterface = {};
      expect(FileManager.tree(testTree)).toBe(testTree);
    });
  });

  describe('extend static method', () => {
    it('should return an extra operations object', () => {
      const extraOperations = {};
      expect(FileManager.extend(extraOperations)).toBe(extraOperations);
    });
  });
});

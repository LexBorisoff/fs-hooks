import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeAll, beforeEach, expect, it, suite } from 'vitest';
import { testSetup } from '../test-setup.js';
import type { FileTreeInterface } from '../../src/types/file-tree.types.js';
import { buildOperations } from '../../src/operations/build-operations.js';
import { createFiles } from '../../src/create-files/create-files.js';
import { tree } from '../constants.js';

const { setup, joinPath } = testSetup('create-files', import.meta);

interface PathTreeDir {
  type: 'dir';
  path: string;
}

interface PathTreeFile {
  type: 'file';
  data: string;
  path: string;
}

type PathTreeItem = PathTreeFile | PathTreeDir;

function getPathArray(
  fileTree: FileTreeInterface,
  basePath: string,
): PathTreeItem[] {
  const result: PathTreeItem[] = [];

  function traverse(node: FileTreeInterface, parentPath: string): void {
    function getPath(key: string): string {
      return path.resolve(`${parentPath}/${key}`);
    }

    Object.entries(node).forEach(([key, value]) => {
      const currentPath = getPath(key);

      if (typeof value === 'string') {
        result.push({
          type: 'file',
          data: value,
          path: currentPath,
        });
        return;
      }

      result.push({
        type: 'dir',
        path: currentPath,
      });

      traverse(value, currentPath);
    });
  }

  traverse(fileTree, basePath);
  return result;
}

suite('createFiles function', { concurrent: false }, () => {
  beforeAll(() => {
    return setup();
  });

  function joinTest(...args: string[]): string {
    return joinPath('operations', ...args);
  }

  const operationsDir = joinTest();
  const operations = buildOperations(operationsDir, tree);
  const pathArray = getPathArray(tree, operationsDir);

  beforeEach(() => {
    fs.mkdirSync(operationsDir);
    createFiles(operations);
  });

  afterEach(() => {
    fs.rmSync(operationsDir, { force: true, recursive: true });
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

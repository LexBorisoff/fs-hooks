import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeAll, beforeEach, expect, it, suite } from 'vitest';
import { testSetup } from '../test-setup.js';
import type { FileTreeInterface } from '../../src/types/file-tree.types.js';
import { buildOperations } from '../../src/operations/build-operations.js';
import { createFiles } from '../../src/create-files/create-files.js';
import { tree } from '../constants.js';
import { deleteFolder } from '../utils.js';

const { testPath, setup, joinPath } = testSetup('create-files', import.meta);

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
          path: currentPath,
          data: value,
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

  const operations = buildOperations(testPath, tree);
  const pathArray = getPathArray(tree, testPath);

  beforeEach(() => {
    createFiles(operations);
  });

  afterEach(() => {
    const files = fs.readdirSync(testPath);
    files.forEach((file) => {
      deleteFolder(joinPath(file));
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

import fs from 'node:fs';
import path from 'node:path';
import { describe, test, expect, beforeEach } from 'vitest';
import { FileManager } from '../src/file-manager.js';
import type {
  BuildOperationTreeType,
  FileTreeInterface,
} from '../src/index.js';
import { getRoot, handleTestFolder, testRoots } from './test-utils.js';

describe('File Manager without custom operations', () => {
  handleTestFolder();

  let fileManager: FileManager;

  beforeEach(() => {
    fileManager = new FileManager();
  });

  test('creating a file manager instance', () => {
    expect(fileManager).toBeDefined();
    expect(fileManager).toHaveProperty('root');
    expect(fileManager.root).toBeTypeOf('function');
  });

  test('calling the "root" method', () => {
    const result = fileManager.root(getRoot(testRoots.callingRootMethod));
    expect(result).toBeDefined();
    expect(result).toHaveProperty('tree');
    expect(result.tree).toBeTypeOf('function');
  });

  test('calling the "tree" method', () => {
    const { tree } = fileManager.root(getRoot(testRoots.callingTreeMethod));
    const result = tree({});
    expect(result).toBeDefined();
    expect(result).toHaveProperty('files');
    expect(result).toHaveProperty('create');
    expect(result.files).toBeTypeOf('object');
    expect(result.create).toBeTypeOf('function');
  });

  test('calling the "create" method', () => {
    const rootPath = getRoot(testRoots.createTree);
    const filePaths = [
      'file1',
      'file2',
      'dir1',
      'dir2',
      'dir2/file1',
      'dir2/file2',
      'dir2/dir1',
      'dir2/dir2',
      'dir2/dir2/file1',
      'dir2/dir2/file2',
    ].map((name) => path.join(rootPath, name));

    const fileData = [
      {
        data: 'File 2 Data',
        path: path.join(rootPath, 'file2'),
      },
      {
        data: 'Dir 2 File 2 Data',
        path: path.join(rootPath, 'dir2', 'file2'),
      },
      {
        data: 'Dir 2 Dir 2 File 2 Data',
        path: path.join(rootPath, 'dir2', 'dir2', 'file2'),
      },
    ];

    fileManager
      .root(rootPath)
      .tree({
        file1: {
          type: 'file',
        },
        file2: {
          type: 'file',
          data: fileData[0].data,
        },
        dir1: {
          type: 'dir',
        },
        dir2: {
          type: 'dir',
          children: {
            file1: {
              type: 'file',
            },
            file2: {
              type: 'file',
              data: fileData[1].data,
            },
            dir1: {
              type: 'dir',
            },
            dir2: {
              type: 'dir',
              children: {
                file1: {
                  type: 'file',
                },
                file2: {
                  type: 'file',
                  data: fileData[2].data,
                },
              },
            },
          },
        },
      } satisfies FileTreeInterface)
      .create();

    expect(fs.existsSync(rootPath)).toBe(true);
    for (const filePath of filePaths) {
      expect(fs.existsSync(filePath)).toBe(true);
    }

    for (const file of Object.values(fileData)) {
      const data = fs.readFileSync(file.path, { encoding: 'utf-8' });
      expect(data).toBe(file.data);
    }
  });

  test('properties of the "files" object', () => {
    const fileTree = {} satisfies FileTreeInterface;
    type FileTree = typeof fileTree;
    const { files } = fileManager
      .root(getRoot(testRoots.fileOperations))
      .tree(fileTree);

    const operations: (keyof BuildOperationTreeType<FileTree>)[] = [
      '$getPath',
      '$exists',
      '$dirCreate',
      '$dirDelete',
      '$fileClear',
      '$fileCreate',
      '$fileWrite',
      '$fileRead',
      '$fileDelete',
    ];

    operations.forEach((method) => {
      expect(files).toHaveProperty(method);
      expect(files[method]).toBeTypeOf('function');
    });
  });
});

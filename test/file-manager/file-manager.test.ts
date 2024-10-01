import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, expect, suite, test } from 'vitest';
import { testSetup } from '../test-setup.js';
import { FileManager } from '../../src/file-manager.js';
import type { FileTreeInterface } from '../../src/file-tree/file-tree.types.js';

const { testPath, setup, joinPath } = testSetup('file-manager', import.meta);

suite('fileManager Suite', () => {
  beforeAll(() => {
    return setup();
  });

  test('creating a file manager instance', () => {
    const fileManager = new FileManager();

    expect(fileManager).toBeDefined();
    expect(fileManager).toHaveProperty('root');
    expect(fileManager.root).toBeTypeOf('function');
  });

  test('calling the "root" method', () => {
    const fileManager = new FileManager();
    const result = fileManager.root(joinPath('root-method'));

    expect(result).toBeDefined();
    expect(result).toHaveProperty('tree');
    expect(result.tree).toBeTypeOf('function');
  });

  test('calling the "tree" method', () => {
    const fileManager = new FileManager();
    const { tree } = fileManager.root(joinPath('tree-method'));
    const result = tree({});

    expect(result).toBeDefined();
    expect(result).toHaveProperty('files');
    expect(result).toHaveProperty('create');
    expect(result.files).toBeTypeOf('object');
    expect(result.create).toBeTypeOf('function');
  });

  test('calling the "create" method', () => {
    const testRoot = joinPath('create-method');
    const fileManager = new FileManager();
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
    ].map((name) => path.join(testRoot, name));

    const fileData = [
      {
        data: 'File 2 Data',
        path: path.join(testRoot, 'file2'),
      },
      {
        data: 'Dir 2 File 2 Data',
        path: path.join(testRoot, 'dir2', 'file2'),
      },
      {
        data: 'Dir 2 Dir 2 File 2 Data',
        path: path.join(testRoot, 'dir2', 'dir2', 'file2'),
      },
    ];

    fileManager
      .root(testRoot)
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

    expect(fs.existsSync(testRoot)).toBe(true);
    for (const filePath of filePaths) {
      expect(fs.existsSync(filePath)).toBe(true);
    }

    for (const file of Object.values(fileData)) {
      const data = fs.readFileSync(file.path, { encoding: 'utf-8' });
      expect(data).toBe(file.data);
    }
  });
});

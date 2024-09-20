import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import { FileManager } from '../../src/file-manager.js';
import type { FileTreeInterface } from '../../src/file-tree/file-tree.types.js';

export function testCreateMethod(testRoot: string): void {
  test('calling the "create" method', () => {
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
}

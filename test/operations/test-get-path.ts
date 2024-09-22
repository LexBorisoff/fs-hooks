import path from 'node:path';
import { expect, test } from 'vitest';
import { FileManager } from '../../src/file-manager.js';

export function testGetPath(testRoot: string): void {
  test('getPath', () => {
    const fileManager = new FileManager();
    const { files } = fileManager.root(testRoot).tree({
      file1: {
        type: 'file',
      },
      dir1: {
        type: 'dir',
        children: {
          file2: {
            type: 'file',
          },
          dir2: {
            type: 'dir',
          },
        },
      },
    });

    expect(files.$getPath()).toBe(testRoot);
    expect(files.file1.$getPath()).toBe(path.join(testRoot, 'file1'));
    expect(files.dir1.$getPath()).toBe(path.join(testRoot, 'dir1'));
    expect(files.dir1.file2.$getPath()).toBe(
      path.join(testRoot, 'dir1', 'file2'),
    );
    expect(files.dir1.dir2.$getPath()).toBe(
      path.join(testRoot, 'dir1', 'dir2'),
    );
  });
}

import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import { FileManager } from '../../../src/file-manager.js';

export function testExists(testRoot: string): void {
  test('exists', () => {
    const fileManager = new FileManager();
    const { create, files } = fileManager.root(testRoot).tree({
      dir1: {
        type: 'dir',
        children: {
          file1: {
            type: 'file',
          },
        },
      },
    });
    create();

    const fileName = 'file1';
    const dirName = 'dir2';
    fs.writeFileSync(path.join(testRoot, fileName), '');
    fs.mkdirSync(path.join(testRoot, dirName));

    expect(files.$exists('dir1')).toBe(true);
    expect(files.$exists(dirName)).toBe(true);
    expect(files.$exists(fileName)).toBe(true);
    expect(files.$exists('not-found')).toBe(false);
    expect(files.dir1.$exists('file1')).toBe(true);
    expect(files.dir1.$exists('not-found')).toBe(false);
  });
}

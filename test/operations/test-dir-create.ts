import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import { FileManager } from '../../src/file-manager.js';

export function testDirCreate(testRoot: string): void {
  test('$dirCreate', () => {
    const fileManager = new FileManager();
    const { create, files } = fileManager.root(testRoot).tree({
      dir1: {
        type: 'dir',
        children: {
          dir1: {
            type: 'dir',
          },
        },
      },
    });

    create();

    // create new dir at root level
    files.$dirCreate('testDir1');
    const testDir1 = path.join(testRoot, 'testDir1');

    // create new dir at root/dir1 level
    files.dir1.$dirCreate('testDir2');
    const testDir2 = path.join(testRoot, 'dir1', 'testDir2');

    // create new dir at root/dir1/dir1 level
    files.dir1.dir1.$dirCreate('testDir3');
    const testDir3 = path.join(testRoot, 'dir1', 'dir1', 'testDir3');

    expect(fs.existsSync(testDir1)).toBe(true);
    expect(fs.existsSync(testDir2)).toBe(true);
    expect(fs.existsSync(testDir3)).toBe(true);

    expect(fs.statSync(testDir1).isDirectory()).toBe(true);
    expect(fs.statSync(testDir2).isDirectory()).toBe(true);
    expect(fs.statSync(testDir3).isDirectory()).toBe(true);
  });
}

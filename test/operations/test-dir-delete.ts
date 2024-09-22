import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import { FileManager } from '../../src/file-manager.js';

export function testDirDelete(testRoot: string): void {
  test('dirDelete - folders created from tree', () => {
    const fileManager = new FileManager();
    const { create, files } = fileManager.root(testRoot).tree({
      dir1A: {
        type: 'dir',
        children: {
          dir2A: {
            type: 'dir',
            children: {
              dir3A: {
                type: 'dir',
              },
            },
          },
        },
      },
      dir1B: {
        type: 'dir',
        children: {
          dir2B: {
            type: 'dir',
            children: {
              dir3B: {
                type: 'dir',
              },
            },
          },
        },
      },
    });

    create();

    const dir1A = path.join(testRoot, 'dir1A');
    const dir2A = path.join(dir1A, 'dir2A');
    const dir3A = path.join(dir2A, 'dir3A');
    const dir1B = path.join(testRoot, 'dir1B');
    const dir2B = path.join(dir1B, 'dir2B');
    const dir3B = path.join(dir2B, 'dir3B');

    // check that created folders exist before testing their deletion
    expect(fs.existsSync(dir1A)).toBe(true);
    expect(fs.existsSync(dir2A)).toBe(true);
    expect(fs.existsSync(dir3A)).toBe(true);
    expect(fs.statSync(dir1A).isDirectory()).toBe(true);
    expect(fs.statSync(dir2A).isDirectory()).toBe(true);
    expect(fs.statSync(dir3A).isDirectory()).toBe(true);

    expect(fs.existsSync(dir1B)).toBe(true);
    expect(fs.existsSync(dir2B)).toBe(true);
    expect(fs.existsSync(dir3B)).toBe(true);
    expect(fs.statSync(dir1B).isDirectory()).toBe(true);
    expect(fs.statSync(dir2B).isDirectory()).toBe(true);
    expect(fs.statSync(dir3B).isDirectory()).toBe(true);

    // test deleting non-nested folders
    files.dir1A.dir2A.$dirDelete('dir3A');
    expect(fs.existsSync(dir3A)).toBe(false);

    files.dir1A.$dirDelete('dir2A');
    expect(fs.existsSync(dir2A)).toBe(false);

    files.$dirDelete('dir1A');
    expect(fs.existsSync(dir1A)).toBe(false);

    // test deleting nested folder
    files.$dirDelete('dir1B');
    expect(fs.existsSync(dir3B)).toBe(false);
    expect(fs.existsSync(dir2B)).toBe(false);
    expect(fs.existsSync(dir1B)).toBe(false);
  });

  test('dirDelete - arbitrary folders', () => {
    const fileManager = new FileManager();
    const { create, files } = fileManager.root(testRoot).tree();
    create();

    const dir1C = path.join(testRoot, 'dir1C');
    const dir2C = path.join(dir1C, 'dir2C');
    const dir3C = path.join(dir2C, 'dir3C');
    const dir1D = path.join(testRoot, 'dir1D');
    const dir2D = path.join(dir1C, 'dir2D');
    const dir3D = path.join(dir2C, 'dir3D');

    fs.mkdirSync(dir1C);
    fs.mkdirSync(dir2C);
    fs.mkdirSync(dir3C);
    fs.mkdirSync(dir1D);
    fs.mkdirSync(dir2D);
    fs.mkdirSync(dir3D);

    // check that created folders exist before testing their deletion
    expect(fs.existsSync(dir1C)).toBe(true);
    expect(fs.existsSync(dir2C)).toBe(true);
    expect(fs.existsSync(dir3C)).toBe(true);
    expect(fs.statSync(dir1C).isDirectory()).toBe(true);
    expect(fs.statSync(dir2C).isDirectory()).toBe(true);
    expect(fs.statSync(dir3C).isDirectory()).toBe(true);

    expect(fs.existsSync(dir1D)).toBe(true);
    expect(fs.existsSync(dir2D)).toBe(true);
    expect(fs.existsSync(dir3D)).toBe(true);
    expect(fs.statSync(dir1D).isDirectory()).toBe(true);
    expect(fs.statSync(dir2D).isDirectory()).toBe(true);
    expect(fs.statSync(dir3D).isDirectory()).toBe(true);

    // test deleting non-nested folders
    files.$dirDelete('dir1C/dir2C/dir3C');
    expect(fs.existsSync(dir3C)).toBe(false);

    files.$dirDelete('dir1C/dir2C');
    expect(fs.existsSync(dir2C)).toBe(false);

    files.$dirDelete('dir1C');
    expect(fs.existsSync(dir1C)).toBe(false);

    // test deleting non-nested folders
    files.$dirDelete('dir1D');
    expect(fs.existsSync(dir3D)).toBe(false);
    expect(fs.existsSync(dir2D)).toBe(false);
    expect(fs.existsSync(dir1D)).toBe(false);
  });
}

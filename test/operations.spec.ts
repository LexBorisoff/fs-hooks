import fs from 'node:fs';
import path from 'node:path';
import { describe, test, expect, beforeEach } from 'vitest';
import { FileManager } from '../src/file-manager.js';
import { getRoot, handleTestFolder, testRoots } from './test-utils.js';

describe('File manager operations', () => {
  handleTestFolder();

  let fileManager: FileManager;

  beforeEach(() => {
    fileManager = new FileManager();
  });

  test('$getPath', () => {
    const rootPath = getRoot(testRoots.getPath);
    const { files } = fileManager.root(rootPath).tree({
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

    expect(files.$getPath()).toBe(rootPath);
    expect(files.file1.$getPath()).toBe(path.join(rootPath, 'file1'));
    expect(files.dir1.$getPath()).toBe(path.join(rootPath, 'dir1'));
    expect(files.dir1.file2.$getPath()).toBe(
      path.join(rootPath, 'dir1', 'file2'),
    );
    expect(files.dir1.dir2.$getPath()).toBe(
      path.join(rootPath, 'dir1', 'dir2'),
    );
  });

  test('$exists', () => {
    const rootPath = getRoot(testRoots.exists);
    const { create, files } = fileManager.root(rootPath).tree({
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
    fs.writeFileSync(path.join(rootPath, fileName), '');
    fs.mkdirSync(path.join(rootPath, dirName));

    expect(files.$exists('dir1')).toBe(true);
    expect(files.$exists(dirName)).toBe(true);
    expect(files.$exists(fileName)).toBe(true);
    expect(files.$exists('not-found')).toBe(false);
    expect(files.dir1.$exists('file1')).toBe(true);
    expect(files.dir1.$exists('not-found')).toBe(false);
  });

  test('$dirCreate', () => {
    const rootPath = getRoot(testRoots.dirCreate);
    const { create, files } = fileManager.root(rootPath).tree();
    create();

    files.$dirCreate('dir1');
    const dir1 = path.join(rootPath, 'dir1');
    expect(fs.existsSync(dir1)).toBe(true);
  });

  test('$fileCreate', () => {
    const rootPath = getRoot(testRoots.fileCreate);
    const { create, files } = fileManager.root(rootPath).tree();
    create();

    const filesData = {
      file2: 'Hello, World!',
      file3: `Hello, World!\nThis is a new line`,
    };

    files.$fileCreate('file1');
    files.$fileCreate('file2', filesData.file2);
    files.$fileCreate('file3', filesData.file3);
    const file1Path = path.join(rootPath, 'file1');
    const file2Path = path.join(rootPath, 'file2');
    const file3Path = path.join(rootPath, 'file3');

    expect(fs.existsSync(file1Path)).toBe(true);
    expect(fs.existsSync(file2Path)).toBe(true);
    expect(fs.readFileSync(file2Path, { encoding: 'utf-8' })).toBe(
      filesData.file2,
    );
    expect(fs.readFileSync(file3Path, { encoding: 'utf-8' })).toBe(
      filesData.file3,
    );
  });
});

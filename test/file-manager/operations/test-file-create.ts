import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import { FileManager } from '../../../src/file-manager.js';

export function testFileCreate(testRoot: string): void {
  test('fileCreate', () => {
    const fileManager = new FileManager();
    const { create, files } = fileManager.root(testRoot).tree();
    create();

    const filesData = {
      file2: 'Hello, World!',
      file3: `Hello, World!\nThis is a new line`,
    };

    files.$fileCreate('file1');
    files.$fileCreate('file2', filesData.file2);
    files.$fileCreate('file3', filesData.file3);
    const file1Path = path.join(testRoot, 'file1');
    const file2Path = path.join(testRoot, 'file2');
    const file3Path = path.join(testRoot, 'file3');

    expect(fs.existsSync(file1Path)).toBe(true);
    expect(fs.existsSync(file2Path)).toBe(true);
    expect(fs.readFileSync(file2Path, { encoding: 'utf-8' })).toBe(
      filesData.file2,
    );
    expect(fs.readFileSync(file3Path, { encoding: 'utf-8' })).toBe(
      filesData.file3,
    );
  });
}

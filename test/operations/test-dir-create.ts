import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import { FileManager } from '../../src/file-manager.js';

export function testDirCreate(testRoot: string): void {
  test('$dirCreate', () => {
    const fileManager = new FileManager();
    const { create, files } = fileManager.root(testRoot).tree();
    create();

    files.$dirCreate('dir1');
    const dir1 = path.join(testRoot, 'dir1');
    expect(fs.existsSync(dir1)).toBe(true);
  });
}

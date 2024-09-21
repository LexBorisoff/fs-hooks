import { expect, test } from 'vitest';
import { FileManager } from '../../src/file-manager.js';
import type { FileTreeInterface } from '../../src/file-tree/file-tree.types.js';
import type { FileOperationTreeType } from '../../src/operations/operation.types.js';

export function testFileOperations(testRoot: string): void {
  test('properties of the "files" object', () => {
    const fileManager = new FileManager();
    const fileTree = {} satisfies FileTreeInterface;
    type FileTree = typeof fileTree;
    const { files } = fileManager.root(testRoot).tree(fileTree);

    const operations: (keyof FileOperationTreeType<FileTree>)[] = [
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
}

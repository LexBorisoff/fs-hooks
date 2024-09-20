import { expect, test } from 'vitest';
import { FileManager } from '../../src/file-manager.js';

export function testCreateFileManager(): void {
  test('creating a file manager instance', () => {
    const fileManager = new FileManager();

    expect(fileManager).toBeDefined();
    expect(fileManager).toHaveProperty('root');
    expect(fileManager.root).toBeTypeOf('function');
  });
}

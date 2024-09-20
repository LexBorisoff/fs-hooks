import { expect, test } from 'vitest';
import { FileManager } from '../../src/file-manager.js';

export function testTreeMethod(testRoot: string): void {
  test('calling the "tree" method', () => {
    const fileManager = new FileManager();
    const { tree } = fileManager.root(testRoot);
    const result = tree({});

    expect(result).toBeDefined();
    expect(result).toHaveProperty('files');
    expect(result).toHaveProperty('create');
    expect(result.files).toBeTypeOf('object');
    expect(result.create).toBeTypeOf('function');
  });
}

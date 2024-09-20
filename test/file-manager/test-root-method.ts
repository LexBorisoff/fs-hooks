import { expect, test } from 'vitest';
import { FileManager } from '../../src/file-manager.js';

export function testRootMethod(testRoot: string): void {
  test('calling the "root" method', () => {
    const fileManager = new FileManager();
    const result = fileManager.root(testRoot);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('tree');
    expect(result.tree).toBeTypeOf('function');
  });
}

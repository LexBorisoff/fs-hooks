import { expect, it, suite } from 'vitest';
import { FileManager } from '@app/file-manager.js';
import * as index from '@app/index.js';

suite('file manager index file', () => {
  it('should export file manager', () => {
    expect(index.FileManager).toBe(FileManager);
  });
});

import { beforeAll, beforeEach, expect, it, suite } from 'vitest';

import { FsHooks } from '@app/fs-hooks.js';
import { testSetup } from '@test-setup';
import { tree } from '@test-utils/tree.js';

import type { TreeInterface } from '@app-types/tree.types.js';

const { setup, testPath } = testSetup('fs-hooks', import.meta);

suite('FsHooks - core properties', { concurrent: false }, () => {
  beforeAll(() => setup());

  let result: FsHooks<TreeInterface>;

  beforeEach(() => {
    result = new FsHooks(testPath, tree);
  });

  it('should be defined', () => {
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(FsHooks);
    expect(result.tree).toBe(tree);
    expect(result.rootPath).toBe(testPath);
    expect(result.useHooks).toBeTypeOf('function');
  });
});

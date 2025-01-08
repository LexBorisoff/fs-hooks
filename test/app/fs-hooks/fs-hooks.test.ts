import { beforeAll, beforeEach, describe, expect, it, suite } from 'vitest';

import { FsHooks } from '@app/fs-hooks.js';
import { coreHooks } from '@core-hooks/core-hooks.js';
import { testSetup } from '@test-setup';
import { tree } from '@test-utils/tree.js';

const { setup, testPath } = testSetup('fs-hooks', import.meta);

suite('FsHooks - core properties', { concurrent: false }, () => {
  beforeAll(() => setup());

  let fsHooks: FsHooks<typeof tree>;

  beforeEach(() => {
    fsHooks = new FsHooks(testPath, tree);
  });

  it('should be defined', () => {
    expect(fsHooks).toBeDefined();
    expect(fsHooks).toBeInstanceOf(FsHooks);
  });

  describe('fsHooks instance properties', () => {
    it('should have correct instance properties', () => {
      expect(fsHooks.tree).toBe(tree);
      expect(fsHooks.rootPath).toBe(testPath);
    });
  });

  describe('useHooks instance method', () => {
    it('should be defined', () => {
      expect(fsHooks.useHooks).toBeTypeOf('function');
    });

    it('should return undefined when target is invalid', () => {
      const hooks = fsHooks.useHooks(coreHooks);
      const result = hooks(() => '');
      expect(result).toBe(undefined);
    });
  });
});

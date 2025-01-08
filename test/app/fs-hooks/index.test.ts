import { expect, test } from 'vitest';

import { createTree } from '@app/create-tree/create-tree.js';
import { FsHooks } from '@app/fs-hooks.js';
import * as index from '@app/index.js';

test('file manager index file', () => {
  const values = [FsHooks, createTree];

  values.forEach((value) => {
    expect(Object.values(index).includes(value)).toBe(true);
  });

  Object.values(index).forEach((value) => {
    expect(values.includes(value)).toBe(true);
  });
});

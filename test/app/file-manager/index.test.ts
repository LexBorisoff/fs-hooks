import { expect, test } from 'vitest';

import { FileManager } from '@app/file-manager.js';
import * as index from '@app/index.js';

test('file manager index file', () => {
  const values = [FileManager];

  values.forEach((value) => {
    expect(Object.values(index).includes(value)).toBe(true);
  });

  Object.values(index).forEach((value) => {
    expect(values.includes(value)).toBe(true);
  });
});

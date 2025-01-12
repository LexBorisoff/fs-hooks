import { expect, test } from 'vitest';

import { coreHooks } from '@core-hooks/core-hooks.js';
import * as index from '@core-hooks/index.js';

test('core hooks index file', () => {
  const values = [coreHooks];

  values.forEach((value) => {
    expect(Object.values(index).includes(value)).toBe(true);
  });

  Object.values(index).forEach((value) => {
    expect(values.includes(value)).toBe(true);
  });
});

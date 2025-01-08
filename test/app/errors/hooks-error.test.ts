import { expect, test } from 'vitest';

import { HooksError } from '@app/errors/hooks.error.js';

test('HooksError class', () => {
  const reason = 'testing';
  const error = new HooksError(reason);

  expect(error).toBeDefined();
  expect(error).toBeInstanceOf(HooksError);
  expect(error.message).toBe(reason);
});

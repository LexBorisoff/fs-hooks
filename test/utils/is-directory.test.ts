import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from 'vitest';
import { isDirectory } from '../../src/utils/is-directory.js';
import { TESTS_ROOT } from '../constants.js';

test('isDirectory', () => {
  const dirPath = path.join(TESTS_ROOT, 'utils');
});

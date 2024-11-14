import { expect, test } from 'vitest';
import { createDir } from '@app/utils/create-dir.js';
import * as index from '@app/utils/index.js';
import { isDirectory } from '@app/utils/is-directory.js';
import { parseData } from '@app/utils/parse-data.js';
import { readFile } from '@app/utils/read-file.js';

test('utils index file', () => {
  const values = [createDir, isDirectory, parseData, readFile];

  values.forEach((fn) => {
    expect(Object.values(index).includes(fn)).toBe(true);
  });

  Object.values(index).forEach((value) => {
    expect(values.includes(value)).toBe(true);
  });
});

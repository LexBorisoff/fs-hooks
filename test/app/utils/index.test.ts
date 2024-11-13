import { expect, it, suite } from 'vitest';
import { createDir } from '@app/utils/create-dir.js';
import * as index from '@app/utils/index.js';
import { isDirectory } from '@app/utils/is-directory.js';
import { parseData } from '@app/utils/parse-data.js';
import { readFile } from '@app/utils/read-file.js';

suite('utils index file', () => {
  it('should export utils', () => {
    expect(index.createDir).toBe(createDir);
    expect(index.isDirectory).toBe(isDirectory);
    expect(index.parseData).toBe(parseData);
    expect(index.readFile).toBe(readFile);
  });
});

import { expect, it, suite } from 'vitest';
import { parseData } from '../../../src/utils/parse-data.js';

suite('parseData function', () => {
  it('should parse data', () => {
    const data = {
      a: 1,
      b: 'test',
      c: true,
    };
    const stringified = JSON.stringify(data);
    expect(parseData(stringified)).toEqual(data);
  });

  it('should return null if data is undefined, null or empty', () => {
    expect(parseData()).toBe(null);
    expect(parseData(null)).toBe(null);
    expect(parseData('')).toBe(null);
  });

  it('should return null if data is invalid', () => {
    expect(parseData('abc')).toBe(null);
  });
});

import { expect, it, suite } from 'vitest';

import { getFileData } from '@app/utils/get-file-data.js';

suite('getFileData function', () => {
  it('should return the same value when passed a valid type', () => {
    const arrayBuffer = new ArrayBuffer(16);

    const views: NodeJS.ArrayBufferView[] = [
      new Uint8Array(arrayBuffer),
      new Uint8ClampedArray(arrayBuffer),
      new Uint16Array(arrayBuffer),
      new Uint32Array(arrayBuffer),
      new Int8Array(arrayBuffer),
      new Int16Array(arrayBuffer),
      new Int32Array(arrayBuffer),
      new Float32Array(arrayBuffer),
      new Float64Array(arrayBuffer),
      new BigInt64Array(arrayBuffer),
      new BigUint64Array(arrayBuffer),
      new DataView(arrayBuffer),
    ];

    expect(getFileData('data')).toBe('data');

    views.forEach((view) => {
      expect(getFileData(view)).toBe(view);
    });
  });

  it('should return a stringified value when passed an invalid type', () => {
    const values = [123, true, null, undefined];

    values.forEach((value) => {
      expect(getFileData(value)).toBe(JSON.stringify(value));
    });
  });
});

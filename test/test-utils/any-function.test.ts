import { expect, it, suite } from 'vitest';

import { anyFunction } from '@test-utils/any-function.js';

suite('anyFunction function', () => {
  it('should return an object with methods as any function', () => {
    const obj = {
      prop1: () => {},
      prop2: [() => {}, 1, 'a', function func() {}],
      prop3: 1,
      prop4: 'abc',
      prop5: true,
      prop6: null,
      prop7: undefined,
      prop8: Symbol(),
      prop9: {},
      prop10: [],
    };

    const result = anyFunction(obj);
    expect(result).toEqual(obj);
  });
});

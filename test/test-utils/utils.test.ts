import fs from 'node:fs';
import { beforeAll, describe, expect, it, suite } from 'vitest';
import { testSetup } from '../test-setup.js';
import { anyFunction, deleteFolder } from '../utils.js';
import { Test } from './constants.js';

const { setup, joinPath } = testSetup(Test.Utils, import.meta);

suite('test utils', () => {
  beforeAll(() => setup());

  describe('deleteFolder function', () => {
    it('should delete a folder', () => {
      const dirName = 'new-dir';
      const dirPath = joinPath(dirName);
      fs.mkdirSync(dirPath);

      expect(fs.existsSync(dirPath)).toBe(true);
      deleteFolder(dirPath);
      expect(fs.existsSync(dirPath)).toBe(false);
    });
  });

  describe('anyFunction function', () => {
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

      const result: any = anyFunction(obj);
      expect(result).toEqual(obj);
    });
  });
});

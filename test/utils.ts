import fs from 'node:fs';
import { expect } from 'vitest';

/**
 * Deletes the folder at the provided path
 * using `force` and `recursive` flags
 */
export function deleteFolder(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, {
      force: true,
      recursive: true,
    });
  }
}

/**
 * Expects the provided object's methods to be any function
 */
export function anyFunction(obj: object): object {
  let result: object = {};

  function convertValue<T>(value: T): any {
    if (value instanceof Function) {
      return expect.any(Function);
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return anyFunction(value);
    }

    if (Array.isArray(value)) {
      return value.map((i) => convertValue(i));
    }

    return value;
  }

  Object.entries(obj).forEach(([key, value]) => {
    result = {
      ...result,
      [key]: convertValue(value),
    };
  });

  return result;
}

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

  Object.entries(obj).forEach(([key, value]) => {
    if (value instanceof Function) {
      result = {
        ...result,
        [key]: expect.any(Function),
      };
      return;
    }

    if (typeof value === 'object') {
      result = {
        ...result,
        [key]: anyFunction(value),
      };
      return;
    }

    result = {
      ...result,
      [key]: value,
    };
  });

  return result;
}

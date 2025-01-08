import { expect } from 'vitest';

import type { CoreHooks } from '@app-types/core-hooks.types.js';

type OperationsObjectType<T extends object> = Record<
  keyof T,
  ReturnType<typeof expect.any>
>;

function buildHooksObject<T extends object>(
  methodNames: (keyof T)[],
): OperationsObjectType<T> {
  return methodNames.reduce<T>(
    (acc, method) => ({ ...acc, [method]: expect.any(Function) }),
    {} as T,
  );
}

const fileHookMethods: (keyof CoreHooks['file'])[] = [
  'clear',
  'getPath',
  'read',
  'write',
];

const dirHookMethods: (keyof CoreHooks['dir'])[] = [
  'dirCreate',
  'dirDelete',
  'exists',
  'fileClear',
  'fileCreate',
  'fileDelete',
  'fileRead',
  'fileWrite',
  'getPath',
];

export const coreHooksObject = {
  file: buildHooksObject(fileHookMethods),
  dir: buildHooksObject(dirHookMethods),
};

import { expect } from 'vitest';

import type {
  DirHooksFn,
  FileHooksFn,
  HooksRecord,
} from '@app-types/hook.types.js';
import type { coreHooks } from '@core-hooks/core-hooks.js';

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

type FileHooksType<Fn extends FileHooksFn<HooksRecord>> =
  Fn extends FileHooksFn<infer H> ? H : HooksRecord;

type DirHooksType<Fn extends DirHooksFn<HooksRecord>> =
  Fn extends DirHooksFn<infer H> ? H : HooksRecord;

export type CoreHooks = {
  file: FileHooksType<typeof coreHooks.file>;
  dir: DirHooksType<typeof coreHooks.dir>;
};

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

export const dirHooksObject = buildHooksObject(dirHookMethods);
export const fileHooksObject = buildHooksObject(fileHookMethods);

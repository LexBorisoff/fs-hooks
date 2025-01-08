import type { DirHooksFn, FileHooksFn, HooksRecord } from './hook.types.js';
import type { coreHooks } from '@core-hooks/core-hooks.js';

type FileHooksType<Fn extends FileHooksFn<HooksRecord>> =
  Fn extends FileHooksFn<infer H> ? H : HooksRecord;

type DirHooksType<Fn extends DirHooksFn<HooksRecord>> =
  Fn extends DirHooksFn<infer H> ? H : HooksRecord;

export type CoreHooks = {
  file: FileHooksType<typeof coreHooks.file>;
  dir: DirHooksType<typeof coreHooks.dir>;
};

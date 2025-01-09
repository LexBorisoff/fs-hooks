import type {
  DirObjectInterface,
  FileObjectInterface,
  TreeInterface,
} from './tree.types.js';

export type HookFn = (...args: any[]) => any;
export type HooksRecord = Record<string, HookFn | undefined>;

export type FileHooksFn<FileHooks extends HooksRecord> = (
  targetFile: FileObjectInterface,
) => FileHooks;

export type DirHooksFn<DirHooks extends HooksRecord> = (
  targetDir: DirObjectInterface<TreeInterface>,
) => DirHooks;

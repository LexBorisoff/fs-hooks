import type {
  DirObjectInterface,
  FileObjectInterface,
  FileType,
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

export type HooksFnReturn<
  Target extends FileType | TreeInterface,
  FileHooks extends HooksRecord | undefined,
  DirHooks extends HooksRecord | undefined,
> = Target extends FileType
  ? FileHooks
  : Target extends TreeInterface
    ? DirHooks
    : undefined;

export type HooksFn<
  Tree extends TreeInterface,
  FileHooks extends HooksRecord | undefined,
  DirHooks extends HooksRecord | undefined,
> = <Target extends FileType | TreeInterface>(
  cb: (tree: Tree) => Target,
) => HooksFnReturn<Target, FileHooks, DirHooks>;

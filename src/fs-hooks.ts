import { HooksError } from '@errors/hooks.error.js';

import { buildObjectTree } from './object-tree/build-object-tree.js';

import type {
  DirHooksFn,
  FileHooksFn,
  HooksRecord,
} from '@app-types/hook.types.js';
import type {
  DirTargetInterface,
  FileTargetInterface,
  FileType,
  TreeInterface,
} from '@app-types/tree.types.js';

interface HooksInterface<
  FileHooks extends HooksRecord,
  DirHooks extends HooksRecord,
> {
  file?: FileHooksFn<FileHooks>;
  dir?: DirHooksFn<DirHooks>;
}

export type HooksFn<
  Tree extends TreeInterface,
  FileHooks extends HooksRecord,
  DirHooks extends HooksRecord,
> = <TreeTarget extends FileType | TreeInterface>(
  cb: (tree: Tree) => TreeTarget,
) => TreeTarget extends FileType
  ? FileHooks
  : TreeTarget extends TreeInterface
    ? DirHooks
    : never;

export class FsHooks<Tree extends TreeInterface> {
  #tree: Tree;

  #rootPath: string;

  constructor(rootPath: string, tree: Tree) {
    this.#rootPath = rootPath;
    this.#tree = tree;
  }

  get tree(): Tree {
    return this.#tree;
  }

  get rootPath(): string {
    return this.#rootPath;
  }

  useHooks<FileHooks extends HooksRecord, DirHooks extends HooksRecord>({
    file,
    dir,
  }: HooksInterface<FileHooks, DirHooks> = {}): HooksFn<
    Tree,
    FileHooks,
    DirHooks
  > {
    type Hooks = HooksFn<Tree, FileHooks, DirHooks>;
    type HooksCb = Parameters<Hooks>[0];
    type HooksResult = ReturnType<Hooks> | undefined;
    type TreeTarget = FileType | TreeInterface;
    type TargetObject = FileTargetInterface | DirTargetInterface<TreeInterface>;

    const objectTree = buildObjectTree(this.#rootPath, this.#tree);
    const tree = this.#tree;

    function getTarget(cb: HooksCb): {
      target: TreeTarget;
      targetObject: TargetObject;
    } {
      let targetObject: TargetObject = objectTree;

      function createProxyTree<T extends TreeInterface>(
        targetTree: T,
        targetObjectTree: DirTargetInterface<T>,
      ): T {
        return new Proxy(targetTree, {
          get(obj, prop: string) {
            targetObject = targetObjectTree.children[prop];

            if (
              typeof obj[prop] === 'object' &&
              obj[prop] != null &&
              targetObject.type === 'dir'
            ) {
              return createProxyTree(obj[prop], targetObject);
            }

            return Reflect.get(obj, prop);
          },
        });
      }

      const proxyTree = createProxyTree(tree, objectTree);
      const target = cb(proxyTree);

      return { target, targetObject };
    }

    function hooks(cb: HooksCb): HooksResult {
      const { target, targetObject } = getTarget(cb);
      const { path } = targetObject;

      if (typeof target === 'string' && targetObject.type === 'file') {
        return file?.({ type: 'file', data: target, path });
      }

      if (typeof target === 'object' && targetObject.type === 'dir') {
        const { children } = targetObject;
        return dir?.({ type: 'dir', children, path });
      }

      throw new HooksError('Invalid tree target');
    }

    return hooks as Hooks;
  }

  static fileHooks<
    FileHooks extends HooksRecord,
    Fn extends FileHooksFn<FileHooks>,
  >(fn: Fn): Fn {
    return fn;
  }

  static dirHooks<
    DirHooks extends HooksRecord,
    Fn extends DirHooksFn<DirHooks>,
  >(fn: Fn): Fn {
    return fn;
  }
}

import { buildObjectTree } from './build-object-tree.js';

import type {
  DirHooksFn,
  FileHooksFn,
  HooksFn,
  HooksRecord,
} from './types/hook.types.js';
import type {
  DirObjectInterface,
  FileObjectInterface,
  FileType,
  TreeInterface,
} from './types/tree.types.js';

interface HooksInterface<
  FileHooks extends HooksRecord,
  DirHooks extends HooksRecord,
> {
  file?: FileHooksFn<FileHooks>;
  dir?: DirHooksFn<DirHooks>;
}

export class TreeHooks<
  FileHooks extends HooksRecord,
  DirHooks extends HooksRecord,
> {
  #hooks: HooksInterface<FileHooks, DirHooks>;

  constructor(hooks: HooksInterface<FileHooks, DirHooks> = {}) {
    this.#hooks = hooks;
  }

  get #fileHooks(): FileHooksFn<FileHooks> | undefined {
    return this.#hooks.file;
  }

  get #dirHooks(): DirHooksFn<DirHooks> | undefined {
    return this.#hooks.dir;
  }

  mountTree<Tree extends TreeInterface>(
    rootPath: string,
    tree: Tree,
  ): HooksFn<Tree, FileHooks, DirHooks> {
    type HooksFnType = HooksFn<Tree, FileHooks, DirHooks>;
    type HooksCb = Parameters<HooksFnType>[0];
    type HooksResult = ReturnType<HooksFnType>;
    type TargetObject =
      | FileObjectInterface
      | DirObjectInterface<TreeInterface>
      | undefined;

    const objectTree = buildObjectTree(rootPath, tree);

    function getTarget(cb: HooksCb): {
      target: FileType | TreeInterface;
      targetObject: TargetObject;
    } {
      let targetObject: TargetObject = objectTree;

      function createProxyTree<T extends TreeInterface>(
        targetTree: T,
        targetObjectTree: DirObjectInterface<T>,
      ): T {
        return new Proxy(targetTree, {
          get(obj, prop: string) {
            targetObject = targetObjectTree.children[prop];

            if (
              typeof obj[prop] === 'object' &&
              obj[prop] != null &&
              targetObjectTree.children[prop].type === 'dir'
            ) {
              return createProxyTree(
                obj[prop],
                targetObjectTree.children[prop],
              );
            }

            return Reflect.get(obj, prop);
          },
        });
      }

      const proxyTree = createProxyTree(tree, objectTree);
      const target = cb?.(proxyTree) ?? tree;

      return { target, targetObject };
    }

    const fileHooks = this.#fileHooks;
    const dirHooks = this.#dirHooks;

    function hooks(cb: HooksCb): HooksResult {
      const { target, targetObject } = getTarget(cb);

      if (typeof target === 'string' && targetObject?.type === 'file') {
        return fileHooks?.(targetObject) as HooksResult;
      }

      if (typeof target === 'object' && targetObject?.type === 'dir') {
        return dirHooks?.(targetObject) as HooksResult;
      }

      throw new Error('invalid target');
    }

    return hooks as HooksFnType;
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

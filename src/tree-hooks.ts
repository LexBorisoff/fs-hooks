import { buildObjectTree } from './object-tree/build-object-tree.js';

import type {
  DirHooksFn,
  FileHooksFn,
  HooksRecord,
} from '@app-types/hook.types.js';
import type {
  DirObjectInterface,
  FileObjectInterface,
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
> = <Target extends FileType | TreeInterface>(
  cb: (tree: Tree) => Target,
) => Target extends FileType
  ? FileHooks
  : Target extends TreeInterface
    ? DirHooks
    : undefined;

export class TreeHooks<Tree extends TreeInterface> {
  #tree: Tree;

  #rootPath: string;

  constructor(rootPath: string, tree: Tree) {
    this.#rootPath = rootPath;
    this.#tree = tree;
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
    type Target = FileType | TreeInterface;
    type TargetObject = FileObjectInterface | DirObjectInterface<TreeInterface>;

    const objectTree = buildObjectTree(this.#rootPath, this.#tree);
    const tree = this.#tree;

    function getTarget(cb: HooksCb): {
      target: Target;
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
      const target = cb(proxyTree);

      return { target, targetObject };
    }

    function hooks(cb: HooksCb): HooksResult {
      const { target, targetObject } = getTarget(cb);

      if (typeof target === 'string' && targetObject.type === 'file') {
        return file?.({
          type: 'file',
          data: target,
          path: targetObject.path,
        });
      }

      if (typeof target === 'object' && targetObject.type === 'dir') {
        return dir?.({
          type: 'dir',
          children: targetObject.children,
          path: targetObject.path,
        });
      }

      return undefined;
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

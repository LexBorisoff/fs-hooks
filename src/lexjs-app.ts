import os from 'node:os';
import path from 'node:path';
import type { FileTreeInterface } from './types/file-tree.types.js';
import { BaseApp, type BaseAppOptions, type Operations } from './base-app.js';
import type { FileTree } from './file-tree.js';

const homedir = path.join(os.homedir(), '.lexjs');
const configDir = path.join(homedir, '.config');

interface AppOptions<T extends FileTreeInterface, C extends FileTreeInterface>
  extends BaseAppOptions<T> {
  configTree?: FileTree<C>;
}

export class LexjsApp<
  T extends FileTreeInterface,
  C extends FileTreeInterface,
> extends BaseApp<T> {
  #configTree?: FileTree<C>;

  constructor(appName: string, { fileTree, configTree }: AppOptions<T, C>) {
    const rootPath = path.join(homedir, appName);
    super(rootPath, { fileTree });

    this.#configTree = configTree;
  }

  config(): Operations<C> {
    return (
      this.#configTree == null ? null : this.#configTree.root(this.rootPath)
    ) as Operations<C>;
  }
}

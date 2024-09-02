export interface WithPath {
  path: string;
  parentPath: string;
}

export interface AppFileInterface {
  type: 'file';
  data?: string | (() => string);
}

export interface AppDirInterface<HasPath extends boolean> {
  type: 'dir';
  children?: FileTree<HasPath>;
}

export type AppFile<HasPath extends boolean = false> = HasPath extends true
  ? AppFileInterface & WithPath
  : AppFileInterface;

export type AppDir<HasPath extends boolean = false> = HasPath extends true
  ? AppDirInterface<true> & WithPath
  : AppDirInterface<false>;

export type FileType<HasPath extends boolean = false> = HasPath extends true
  ? AppFile<true> | AppDir<true>
  : AppFile | AppDir<false>;

export type FileTree<HasPath extends boolean = false> = Record<
  string,
  FileType<HasPath>
>;

export type PathTree<T extends FileTree<false>> = {
  [K in keyof T]: T[K] extends AppDir
    ? T[K]['children'] extends FileTree<false>
      ? AppDir<true> & { children: PathTree<T[K]['children']> }
      : AppDir<true>
    : AppFile<true>;
};

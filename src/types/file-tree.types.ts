export interface WithPath {
  path: string;
  parentPath: string;
}

export interface AppFileInterface {
  type: 'file';
  data?: string | (() => string);
  skip?: boolean;
}

export interface AppDirInterface<HasPath extends boolean> {
  type: 'dir';
  children?: FileTreeInterface<HasPath>;
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

export type FileTreeInterface<HasPath extends boolean = false> = Record<
  string,
  FileType<HasPath>
>;

export type PathTreeInterface<T extends FileTreeInterface<false>> = {
  [K in keyof T]: T[K] extends AppDir
    ? T[K]['children'] extends FileTreeInterface<false>
      ? AppDir<true> & { children: PathTreeInterface<T[K]['children']> }
      : AppDir<true>
    : AppFile<true>;
};

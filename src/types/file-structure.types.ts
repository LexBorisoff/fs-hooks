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
  children?: FileStructure<HasPath>;
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

export type FileStructure<HasPath extends boolean = false> = Record<
  string,
  FileType<HasPath>
>;

export type PathStructure<S extends FileStructure<false>> = {
  [K in keyof S]: S[K] extends AppDir
    ? S[K]['children'] extends FileStructure<false>
      ? AppDir<true> & { children: PathStructure<S[K]['children']> }
      : AppDir<true>
    : AppFile<true>;
};

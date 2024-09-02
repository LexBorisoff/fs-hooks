interface WithPath {
  path: string;
  parentPath: string;
}

interface AppFileInterface {
  type: 'file';
  contents?: string | (() => string);
}

interface AppDirInterface<HasPath extends boolean> {
  type: 'dir';
  children?: FileStructure<HasPath>;
}

export type AppFile<HasPath extends boolean = false> = HasPath extends true
  ? AppFileInterface & WithPath
  : AppFileInterface;

export type AppDir<HasPath extends boolean = false> = HasPath extends true
  ? AppDirInterface<HasPath> & WithPath
  : AppDirInterface<HasPath>;

export type FileType<HasPath extends boolean = false> = HasPath extends true
  ? AppFile<true> | AppDir<true>
  : AppFile | AppDir<false>;

export type FileStructure<HasPath extends boolean = false> = Record<
  string,
  FileType<HasPath>
>;

export interface WithPath {
  path: string;
  parentPath: string;
}

export interface FileInterface {
  type: 'file';
  data?: string | (() => string);
  skip?: boolean;
}

export interface DirInterface<HasPath extends boolean> {
  type: 'dir';
  children?: FileTree<HasPath>;
}

export type FileType<HasPath extends boolean = false> = HasPath extends true
  ? (FileInterface & WithPath) | (DirInterface<HasPath> & WithPath)
  : FileInterface | DirInterface<HasPath>;

export type FileTree<HasPath extends boolean = false> = Record<
  string,
  FileType<HasPath>
>;

export type FileWithPath<File extends FileInterface> = File & WithPath;

export type DirWithPath<Children extends FileTree | undefined = undefined> =
  Children extends FileTree
    ? DirInterface<true> & { children: PathTree<Children> } & WithPath
    : DirInterface<true> & WithPath;

export type PathTree<T extends FileTree> = {
  [K in keyof T]: T[K] extends FileInterface
    ? FileWithPath<T[K]>
    : T[K] extends DirInterface<false>
      ? T[K]['children'] extends FileTree
        ? DirWithPath<T[K]['children']>
        : DirWithPath
      : never;
};

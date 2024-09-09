export interface PathInterface {
  path: string;
}

export interface FileInterface {
  type: 'file';
  data?: string | (() => string);
  skip?: boolean;
}

export interface DirInterface {
  type: 'dir';
  children?: FileTreeInterface;
}

export interface FileWithPathInterface extends FileInterface, PathInterface {}
export interface DirWithPathInterface extends DirInterface, PathInterface {}

export type FileWithPathType<F extends FileInterface> = F & PathInterface;
export type DirWithPathType<D extends DirInterface> = D & PathInterface;

export interface FileTreeInterface {
  [key: string]: FileInterface | DirInterface;
}

export type PathTreeType<T extends FileTreeInterface> = {
  [key in keyof T]: T[key] extends FileInterface
    ? FileWithPathType<T[key]>
    : T[key] extends DirInterface
      ? T[key]['children'] extends FileTreeInterface
        ? DirWithPathType<
            T[key] & { children: PathTreeType<T[key]['children']> }
          >
        : DirWithPathType<T[key]>
      : never;
};

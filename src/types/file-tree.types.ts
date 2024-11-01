export type FileType = string;

export interface FileTreeInterface {
  [key: string]: FileType | FileTreeInterface;
}

export interface PathInterface {
  path: string;
}

export interface FileObjectInterface extends PathInterface {
  data: string;
}

export interface DirObjectInterface<ChildTree extends FileTreeInterface>
  extends PathInterface {
  children: FileTreeType<ChildTree>;
}

export type FileTreeType<Tree extends FileTreeInterface> = {
  [key in keyof Tree]: Tree[key] extends FileType
    ? FileObjectInterface
    : Tree[key] extends FileTreeInterface
      ? DirObjectInterface<Tree[key]>
      : never;
};

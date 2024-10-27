export type TreeFileType = string;

export interface TreeDirInterface {
  [name: string]: TreeFileType | TreeDirInterface;
}

export interface FileTreeInterface {
  [key: string]: TreeFileType | TreeDirInterface;
}

export interface PathInterface {
  path: string;
}

export interface FileObjectInterface extends PathInterface {
  type: 'file';
  data: string;
}

export interface DirObjectInterface<ChildTree extends FileTreeInterface>
  extends PathInterface {
  type: 'dir';
  children: FileTreeType<ChildTree>;
}

export type FileTreeType<Tree extends FileTreeInterface> = {
  [key in keyof Tree]: Tree[key] extends TreeFileType
    ? FileObjectInterface
    : Tree[key] extends TreeDirInterface
      ? DirObjectInterface<Tree[key]>
      : never;
};

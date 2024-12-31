export type FileType = string;

export interface TreeInterface {
  [key: string]: FileType | TreeInterface;
}

export interface PathInterface {
  path: string;
}

export interface FileObjectInterface extends PathInterface {
  type: 'file';
  data: string;
}

export interface DirObjectInterface<Tree extends TreeInterface>
  extends PathInterface {
  type: 'dir';
  children: TreeType<Tree>;
}

export type TreeType<Tree extends TreeInterface> = {
  [key in keyof Tree]: Tree[key] extends FileType
    ? FileObjectInterface
    : Tree[key] extends TreeInterface
      ? DirObjectInterface<Tree[key]>
      : never;
};

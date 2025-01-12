export type FileType = string;

export interface TreeInterface {
  [key: string]: FileType | TreeInterface;
}

export interface PathInterface {
  path: string;
}

export interface FileTargetInterface extends PathInterface {
  type: 'file';
}

export interface DirTargetInterface<Tree extends TreeInterface>
  extends PathInterface {
  type: 'dir';
  children: ObjectTreeType<Tree>;
}

export type ObjectTreeType<Tree extends TreeInterface> = {
  [key in keyof Tree]: Tree[key] extends FileType
    ? FileTargetInterface
    : Tree[key] extends TreeInterface
      ? DirTargetInterface<Tree[key]>
      : never;
};

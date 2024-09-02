import type { FileStructure, AppDir } from './app-structure.types.js';

export interface FileActions {
  read: () => string | null;
  write: (contents: string | (() => string)) => void;
}

export interface DirActions {}

export type AppActions<S extends FileStructure<boolean>> = {
  [K in keyof S]: S[K] extends AppDir
    ? S[K]['children'] extends FileStructure
      ? DirActions & AppActions<S[K]['children']>
      : DirActions
    : FileActions;
};

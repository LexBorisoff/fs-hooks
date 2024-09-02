import type {
  FileStructure,
  AppDir,
} from '../../types/file-structure.types.js';

export interface FileOperations {
  read: () => string | null;
  write: (contents: string | (() => string)) => void;
  clear: () => void;
}

export type OperationStructure<S extends FileStructure<false>> = {
  [K in keyof S]: S[K] extends AppDir
    ? S[K]['children'] extends FileStructure
      ? OperationStructure<S[K]['children']>
      : {}
    : FileOperations;
};

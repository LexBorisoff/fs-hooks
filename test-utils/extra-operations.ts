import type {
  DirOperationsFn,
  FileOperationsFn,
} from '@app/types/operation.types.js';

export type ExtraDirOperations = {
  getDirPath: () => string;
  getDirChildren: () => string[];
  plusOne: (num: number) => number;
};

export type ExtraFileOperations = {
  getFileData: () => string;
  getFilePath: () => string;
  plusOne: (num: number) => number;
};

export const extraDirOperations: DirOperationsFn<ExtraDirOperations> = (
  dir,
) => ({
  getDirPath() {
    return dir.path;
  },
  getDirChildren() {
    return Object.keys(dir.children);
  },
  plusOne(num) {
    return num + 1;
  },
});

export const extraFileOperations: FileOperationsFn<ExtraFileOperations> = (
  file,
) => ({
  getFileData() {
    return file.data;
  },
  getFilePath() {
    return file.path;
  },
  plusOne(value) {
    return value + 1;
  },
});

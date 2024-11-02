import { expect } from 'vitest';
import type { FileTreeInterface } from '../src/types/file-tree.types.js';
import type {
  DirOperationsInterface,
  FileOperationsInterface,
} from '../src/types/operation.types.js';

export const KEEP_TEST_FOLDER: boolean =
  process.env.KEEP_TEST_FOLDER === 'true';

interface Files {
  file1: string;
  file2: string;
  file3: string;
  file4: string;
}

const fileData = ['', 'Line 1', 'Line 1\nLine 2', 'Line 1\nLine 2\nLine 3'];

function files(): Files {
  return fileData.reduce<Files>((acc, data, i) => {
    return {
      ...acc,
      [`file${i + 1}`]: data,
    };
  }, {} as Files);
}

export const tree = {
  ...files(),
  dir1: {},
  dir2: {
    ...files(),
    dir1: {},
    dir2: {
      ...files(),
    },
  },
} satisfies FileTreeInterface;

export type Tree = typeof tree;

const fileOperationsMethods: (keyof FileOperationsInterface)[] = [
  '$clear',
  '$getPath',
  '$read',
  '$write',
];

const dirOperationsMethods: (keyof DirOperationsInterface<Tree>)[] = [
  '$dirCreate',
  '$dirDelete',
  '$exists',
  '$fileClear',
  '$fileCreate',
  '$fileDelete',
  '$fileRead',
  '$fileWrite',
  '$getPath',
];

export const fileOperationsObject = fileOperationsMethods.reduce(
  (acc, method) => ({ ...acc, [method]: expect.any(Function) }),
  {},
);

export const dirOperationsObject = dirOperationsMethods.reduce(
  (acc, method) => ({ ...acc, [method]: expect.any(Function) }),
  {},
);

type FileOperationsObject = typeof fileOperationsObject;
type DirOperationsObject = typeof dirOperationsObject;
type OperationsTreeObject = DirOperationsObject &
  Record<string, FileOperationsObject | DirOperationsObject>;

function buildOperationsTreeObject(): OperationsTreeObject {
  function traverse(
    node: FileTreeInterface,
  ): Record<string, FileOperationsObject | DirOperationsObject> {
    const result: Record<string, FileOperationsObject | DirOperationsObject> =
      {};

    Object.entries(node).forEach(([key, value]) => {
      if (typeof value === 'string') {
        result[key] = fileOperationsObject;
        return;
      }

      result[key] = {
        ...dirOperationsObject,
        ...traverse(value),
      };
    });

    return result;
  }

  return {
    ...dirOperationsObject,
    ...traverse(tree),
  };
}

export const operationsTreeObject = buildOperationsTreeObject();

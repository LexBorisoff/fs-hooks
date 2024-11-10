import { expect } from 'vitest';
import type {
  DirOperationsInterface,
  FileOperationsInterface,
} from '../src/types/operation.types.js';
import type { FileTreeInterface } from '../src/types/file-tree.types.js';
import { tree, type Tree } from './tree.js';

type OperationsTreeObject = DirOperationsObject &
  Record<string, FileOperationsObject | DirOperationsObject>;

type OperationsObjectType<T extends object> = Record<
  keyof T,
  ReturnType<typeof expect.any>
>;
type FileOperationsObject = OperationsObjectType<FileOperationsInterface>;
type DirOperationsObject = OperationsObjectType<DirOperationsInterface<Tree>>;

const fileOperationMethods: (keyof FileOperationsInterface)[] = [
  '$clear',
  '$getPath',
  '$read',
  '$write',
];

const dirOperationMethods: (keyof DirOperationsInterface<Tree>)[] = [
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

export function buildOperationsObject<T extends object>(
  methodNames: (keyof T)[],
): OperationsObjectType<T> {
  return methodNames.reduce<T>(
    (acc, method) => ({ ...acc, [method]: expect.any(Function) }),
    {} as T,
  );
}

export const fileOperationsObject = buildOperationsObject(fileOperationMethods);
export const dirOperationsObject = buildOperationsObject(dirOperationMethods);

export function buildOperationsTreeObject(
  fileTree: FileTreeInterface,
): OperationsTreeObject {
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
    ...traverse(fileTree),
  };
}

export const operationsTreeObject = buildOperationsTreeObject(tree);

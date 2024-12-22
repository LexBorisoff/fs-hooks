import { expect } from 'vitest';

import { tree } from './tree.js';

import type { FileTreeInterface } from '@app-types/file-tree.types.js';
import type {
  DirOperationsInterface,
  FileOperationsInterface,
} from '@app-types/operation.types.js';

type OperationsObjectType<T extends object> = Record<
  keyof T,
  ReturnType<typeof expect.any>
>;
type FileOperationsObject = OperationsObjectType<FileOperationsInterface>;
type DirOperationsObject = OperationsObjectType<
  DirOperationsInterface<FileTreeInterface>
>;

type FileMethod = keyof FileOperationsInterface;
const fileOperationMethods: FileMethod[] = [
  '$clear',
  '$getPath',
  '$read',
  '$write',
];

type DirMethod = keyof DirOperationsInterface<FileTreeInterface>;
const dirOperationMethods: DirMethod[] = [
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

export function buildOperationsTreeObject(fileTree: FileTreeInterface): object {
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

      if (typeof value === 'object') {
        result[key] = {
          ...dirOperationsObject,
          ...traverse(value),
        };
      }
    });

    return result;
  }

  return {
    ...dirOperationsObject,
    ...traverse(fileTree),
  };
}

export const operationsTreeObject = buildOperationsTreeObject(tree);

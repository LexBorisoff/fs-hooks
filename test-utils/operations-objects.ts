import { expect } from 'vitest';
import type {
  FileTreeInterface,
  DirOperationsInterface,
  FileOperationsInterface,
} from '@app-types';
import { tree } from './tree.js';

type OperationsTreeObject = DirOperationsObject &
  Record<string, FileOperationsObject | DirOperationsObject>;

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

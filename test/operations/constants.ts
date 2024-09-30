import type {
  DirOperationsInterface,
  FileOperationsInterface,
} from '../../src/operations/operation.types.js';

export const dirOperationMethods: (keyof DirOperationsInterface<
  undefined,
  undefined
>)[] = [
  '$getPath',
  '$exists',
  '$dirCreate',
  '$dirDelete',
  '$fileClear',
  '$fileCreate',
  '$fileDelete',
  '$fileRead',
  '$fileWrite',
];

export const fileOperationMethods: (keyof FileOperationsInterface)[] = [
  '$getPath',
  '$exists',
  '$read',
  '$write',
  '$clear',
];

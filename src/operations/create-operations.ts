import { getAppHomedir } from '../homedir/app-homedir.js';
import type { FileTreeInterface } from '../types/file-tree.types.js';
import { operationsMapper } from '../mappers/operations.mapper.js';
import { pathsMapper } from '../mappers/paths.mapper.js';
import type { OperationTreeInterface } from './types/operations.types.js';

export function createOperations<T extends FileTreeInterface>(
  appName: string,
  fileTree: T,
): OperationTreeInterface<T> {
  const appHomedir = getAppHomedir(appName);
  const pathTree = pathsMapper(appHomedir, fileTree);
  return operationsMapper(pathTree);
}

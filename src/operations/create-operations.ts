import { getAppHomedir } from '../homedir/app-homedir.js';
import type { FileTree } from '../types/file-structure.types.js';
import type { OperationStructure } from './types/operations.types.js';
import { operationsMapper } from './mappers/operations.mapper.js';
import { pathsMapper } from './mappers/paths.mapper.js';

export function createOperations<T extends FileTree>(
  appName: string,
  fileTree: T,
): OperationStructure<T> {
  const appHomedir = getAppHomedir(appName);
  const pathTree = pathsMapper(appHomedir, fileTree);
  return operationsMapper(pathTree);
}

import type { FileStructure } from '../types/file-structure.types.js';
import type { OperationStructure } from './types/operations.types.js';
import { operationsMapper } from './mappers/operations.mapper.js';
import { pathsMapper } from './mappers/paths.mapper.js';

export function createOperations<S extends FileStructure>(
  appName: string,
  fileStructure: S,
): OperationStructure<S> {
  return operationsMapper(pathsMapper(appName, fileStructure));
}

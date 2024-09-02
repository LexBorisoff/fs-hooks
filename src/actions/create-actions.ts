import type { AppActions } from './types/app-actions.types.js';
import type { FileStructure } from './types/app-structure.types.js';
import { actionsMapper } from './mappers/actions.mapper.js';
import { pathsMapper } from './mappers/paths.mapper.js';

export function createActions<S extends FileStructure>(
  appName: string,
  fileStructure: S,
): AppActions<S> {
  const withPaths = pathsMapper(appName, fileStructure);
  return actionsMapper(withPaths);
}

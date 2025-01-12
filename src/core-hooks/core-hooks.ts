import { dirHooks } from './dir-hooks.js';
import { fileHooks } from './file-hooks.js';

export const coreHooks = {
  file: fileHooks,
  dir: dirHooks,
} as const;

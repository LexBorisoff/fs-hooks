import fs from 'node:fs';
import type { FileStructure } from '../types/file-structure.types.js';

export function createFiles<S extends FileStructure<true>>(
  pathStructure: S,
): void {
  Object.values(pathStructure).forEach((file) => {
    if (file.type === 'file') {
      fs.writeFileSync(
        file.path,
        (file.data instanceof Function ? file.data() : file.data) ?? '',
      );
      return;
    }

    if (!fs.existsSync(file.path)) {
      fs.mkdirSync(file.path);
    }

    if (file.children != null && Object.keys(file.children).length > 0) {
      createFiles(file.children);
    }
  });
}

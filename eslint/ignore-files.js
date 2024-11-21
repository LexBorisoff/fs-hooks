import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';

export function ignoreFile(file, meta) {
  const __filename = fileURLToPath(meta.url);
  const __dirname = path.dirname(__filename);
  const gitignorePath = path.resolve(__dirname, file);
  return includeIgnoreFile(gitignorePath);
}

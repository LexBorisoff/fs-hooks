import url from 'node:url';
import path from 'node:path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const TESTS_ROOT = path.resolve(__dirname, '../__tests__');
export const KEEP_TEST_FOLDER: boolean =
  process.env.KEEP_TEST_FOLDER === 'true';

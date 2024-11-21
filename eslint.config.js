import globals from 'globals';
import * as tseslint from 'typescript-eslint';
import { ignoreFile } from './eslint/ignore-files.js';
import {
  recommendedConfig,
  recommendedConfigTypescript,
} from './eslint/recommended.config.js';

const lexjs = {
  ignoreFile,
  configs: {
    recommended: recommendedConfig,
    typescript: recommendedConfigTypescript,
  },
};

export default tseslint.config(
  lexjs.ignoreFile('.gitignore', import.meta),
  lexjs.configs.recommended,
  lexjs.configs.typescript,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        projectService: {
          allowDefaultProject: ['*.js', 'eslint/*'],
        },
      },
      globals: {
        ...globals.node,
        ...globals.es2016,
      },
    },
  },
  {
    files: ['src/**/*'],
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.app.json',
        },
      },
    },
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['test*/**/*'],
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.test.json',
        },
      },
    },
  },
);

import importPlugin from 'eslint-plugin-import';
import * as tseslint from 'typescript-eslint';

const importConfig = tseslint.config(importPlugin.flatConfigs.recommended, {
  rules: {
    'import/no-unresolved': 'warn',
    'import/no-cycle': 'error',
    'import/no-duplicates': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'export' },
      { blankLine: 'always', prev: 'export', next: '*' },
      { blankLine: 'any', prev: 'export', next: 'export' },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
});

const importConfigTypescript = tseslint.config(
  importPlugin.flatConfigs.typescript,
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
);

export { importConfig, importConfigTypescript };

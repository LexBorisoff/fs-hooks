import eslint from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import * as tseslint from 'typescript-eslint';
import { importConfig, importConfigTypescript } from './import.config.js';

const recommendedConfig = tseslint.config(
  eslint.configs.recommended,
  prettierRecommended,
  importConfig,
  {
    rules: {
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'warn',
      'object-shorthand': 'error',
      'consistent-return': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'lines-between-class-members': ['error', 'always'],
      'no-console': 'warn',
    },
  },
);

const recommendedConfigTypescript = tseslint.config(
  tseslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  importConfigTypescript,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
        },
      ],
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allowSingleOrDouble',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
      ],
    },
  },
);

export { recommendedConfig, recommendedConfigTypescript };

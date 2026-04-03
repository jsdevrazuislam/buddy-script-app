import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';

export default [
  prettierPlugin,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2024,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import': importPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'import/order': [
        'error',
        {
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
        }
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
];

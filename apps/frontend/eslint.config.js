//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import pluginOxlint from 'eslint-plugin-oxlint'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    name: 'app/typescript-style',
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      complexity: ['warn', { max: 10 }],
      'no-nested-ternary': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Use literal unions or `as const` objects instead of enums.',
        },
        {
          selector: 'IfStatement > IfStatement.alternate',
          message: 'Avoid `else if`. Prefer early returns.',
        },
        {
          selector: 'IfStatement > :not(IfStatement).alternate',
          message: 'Avoid `else`. Prefer early returns.',
        },
        {
          selector: "TSAsExpression > TSAsExpression[typeAnnotation.type='TSUnknownKeyword']",
          message: 'Avoid `as unknown as T`. Use type guards or generics.',
        },
      ],
    },
  },
  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
  {
    ignores: ['eslint.config.js', 'prettier.config.js'],
  },
]

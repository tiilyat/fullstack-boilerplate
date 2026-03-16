import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from 'eslint-config-prettier/flat'
import pluginOxlint from 'eslint-plugin-oxlint'
import pluginVue from 'eslint-plugin-vue'
import { globalIgnores } from 'eslint/config'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },
  globalIgnores(['**/dist/**', '**/coverage/**']),
  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    name: 'app/vue-component-rules',
    files: ['src/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/custom-event-name-casing': ['error', 'kebab-case'],
      'vue/no-unused-properties': ['error', { groups: ['props', 'data', 'computed', 'methods'] }],
      'vue/no-unused-refs': 'error',
      'vue/no-unused-emit-declarations': 'error',
      'vue/define-props-destructuring': 'error',
      'vue/prefer-use-template-ref': 'error',
      'vue/require-expose': 'warn',
      'vue/require-explicit-slots': 'warn',
      'vue/max-template-depth': ['error', { maxDepth: 8 }],
      'vue/max-props': ['error', { maxProps: 6 }],
    },
  },
  {
    name: 'app/typescript-style',
    files: ['src/**/*.{ts,vue}'],
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
  skipFormatting,
)

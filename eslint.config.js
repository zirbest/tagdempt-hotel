const solid = require('eslint-plugin-solid/dist/configs/typescript')
const tsParser = require('@typescript-eslint/parser')
const { antfu } = require('@antfu/eslint-config')

module.exports = antfu(
  {
    overrides: {
      typescript: {
        'node/prefer-global/process': ['error', 'always'],
        'unicorn/prefer-node-protocol': 'off',
        'no-console': 'off',
        // 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
  },
  {
    files: ['**/*.tsx'],
    ...solid,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
        ecmaVersion: 2021,
      },
    },
  },
  {
    ignores: [
      'src/renderer/src/components/ui/*.*',
      'scripts/*',
    ],
  },
)

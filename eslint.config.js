const typescriptParser = require('@typescript-eslint/parser')
const typescript = require('@typescript-eslint/eslint-plugin')
const eslintConfigPrettier = require('eslint-config-prettier')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')

module.exports = [
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: { typescript },
    files: ['**/src/**/*.ts', '**/test/**/*.ts'],
    ...eslintConfigPrettier,
    ...eslintPluginPrettierRecommended
  }
]

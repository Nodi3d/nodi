module.exports = {
  root: true,
  globals: {
    WeakRef: false
  },
  env: {
    es6: true,
    browser: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  ignorePatterns: [
    'verb.js',
    '*.d.ts',
    'test/*'
  ],
  rules: {
    'semi': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'no-constant-condition': 'off',
    '@typescript-eslint/semi': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-use-before-define': 'error'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2019,
    tsconfigRootDir: __dirname
  }
};

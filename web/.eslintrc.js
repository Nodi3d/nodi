module.exports = {
  root: true,
  globals: {
    WeakRef: false
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended'
  ],
  plugins: [
  ],
  ignorePatterns: [
    '**/*.js',
    '*.worker.js',
    '*.d.ts',
    'test/*',
  ],
  rules: {
    semi: ['off'],
    'no-unused-vars': ['off'],
    '@typescript-eslint/semi': ['error'],
    '@typescript-eslint/no-unused-vars': ['off'],
    'vue/no-v-html': ['off'],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error']
  }
};

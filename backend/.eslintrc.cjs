module.exports = {
  plugins: ['vitest-globals'],
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true,
    "vitest-globals/env": true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};

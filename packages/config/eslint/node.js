const baseConfig = require('./index.js');

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
const config = [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      // Node.js specific rules
      'unicorn/no-process-exit': 'error',
      'no-process-env': 'off', // We use validated config, not raw process.env
      '@typescript-eslint/no-floating-promises': ['error', {
        ignoreVoid: false,
        ignoreIIFE: false,
      }],
    },
  },
  {
    // Relax rules for test files
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-unused-modules': 'off',
    },
  },
];

module.exports = config;

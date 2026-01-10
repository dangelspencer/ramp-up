module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    es2020: true,
    node: true,
    jest: true,
  },
  rules: {
    // Allow unused vars that start with underscore
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // Allow require imports for dynamic imports
    '@typescript-eslint/no-require-imports': 'off',
    // Allow any for callback types in libraries
    '@typescript-eslint/no-explicit-any': 'warn',
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    // TypeScript specific
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    'prefer-const': 'warn',
    'no-var': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'dist/',
    'build/',
    'rampup-mockups.tsx',
    '*.config.js',
    '*.config.ts',
    'babel.config.js',
    'metro.config.js',
    'drizzle.config.ts',
    '__tests__/**',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};

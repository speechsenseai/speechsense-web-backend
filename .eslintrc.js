module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
  ],
  plugins: ['import', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['dist', '.eslintrc.js'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: '.',
  },
  rules: {
    eqeqeq: [
      'error',
      'always',
      {
        null: 'ignore',
      },
    ],
    'prefer-const': 'error',
    'no-restricted-syntax': [
      'warn',
      {
        selector: "MemberExpression[property.name='log']",
        message: 'Delete console.log',
      },
    ],
    'no-mixed-operators': [
      'error',
      {
        groups: [
          ['+', '-', '*', '/', '%', '**'],
          ['&', '|', '^', '~', '<<', '>>', '>>>'],
          ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
          ['&&', '||'],
          ['in', 'instanceof'],
        ],
        allowSamePrecedence: true,
      },
    ],
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true,
      },
    ],
    'no-var': 'error',
    'no-self-compare': 'error',
    'no-eval': 'error',
    'max-len': [
      'error',
      {
        code: 120,
      },
    ],
    'space-infix-ops': 'error',
    'import/no-duplicates': 'error',
    'import/no-useless-path-segments': 'error',
    'import/newline-after-import': [
      'error',
      {
        count: 1,
      },
    ],
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'import/named': 'off',
    '@typescript-eslint/consistent-generic-constructors': [
      'error',
      'constructor',
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/method-signature-style': 'error',
    '@typescript-eslint/no-duplicate-enum-values': 'error',
    '@typescript-eslint/no-duplicate-type-constituents': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    '@typescript-eslint/no-redundant-type-constituents': 'error',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    '@typescript-eslint/no-unsafe-enum-comparison': 'error',
    '@typescript-eslint/non-nullable-type-assertion-style': 'error',
  },
};

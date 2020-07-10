module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['import'],
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  settings: {
    'import/extensions': ['.js', '.ts'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
      typescript: {},
    },
    rules: {
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          ts: 'never',
        },
      ],
    },
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'import'],
      extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
      ],
      settings: {
        'import/extensions': ['.js', '.ts'],
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts'],
        },
        'import/resolver': {
          node: {
            extensions: ['.js', '.ts'],
          },
          typescript: {},
        },
      },
      rules: {
        'no-console': 'off',
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            js: 'never',
            ts: 'never',
          },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        'import/prefer-default-export': 'off',
        'no-throw-literal': 'off',
      },
    },
  ],
};

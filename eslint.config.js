import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  formatters: true,
  test: {
    overrides: {
      'test/no-import-node-test': 'off',
    },
  },
  ignores: [
    '**/*.md',
    '**/*.yaml',
    '**/*.yml',
    'node_modules',
    '.yarn',
    '.eslintrc.js',
    'dist',
  ],
})

import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
  vue: true,
  formatters: {
    css: true,
    html: true,
  },
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

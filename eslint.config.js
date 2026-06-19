const js = require('@eslint/js');
const pluginVue = require('eslint-plugin-vue');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    ignores: ['dist/', 'node_modules/']
  }
];

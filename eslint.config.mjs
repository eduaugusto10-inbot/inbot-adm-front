import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginJs from '@eslint/js';
import { configs as tseslint } from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },

  {
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
  },

  pluginJs.configs.recommended,
  ...tseslint.recommended,
  ...fixupConfigRules(pluginReact.configs.recommended),

  {
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'jsx-a11y': pluginJsxA11y,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/alt-text': 'warn',
    },
  },
];

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';
import tseslint from 'typescript-eslint';
import tailwind from '@poupe/eslint-plugin-tailwindcss';

// Patch the recommended config to use the actual plugin instead of an empty object
const tailwindConfig = tailwind.configs.recommended;
tailwindConfig.plugins = {
  tailwindcss: tailwind
};

export default tseslint.config(
  { ignores: ['dist', '*.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  reactX.configs['recommended-typescript'],
  reactDom.configs.recommended,
  tailwindConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      tailwindcss: {
        callees: ['classnames', 'clsx', 'ctl'],
        config: 'src/index.css',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
);

// Configuración de ESLint (flat config, ESLint 9+).
// El frontend es React 18 + Vite (JavaScript/JSX, sin TypeScript).
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'test-results/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      // No usamos prop-types (proyecto JS sin validación de props).
      'react/prop-types': 'off',
      // El texto de la UI está en español y contiene apóstrofes/comillas.
      'react/no-unescaped-entities': 'off',
      'react-refresh/only-export-components': 'warn',
    },
  },
  prettier,
];

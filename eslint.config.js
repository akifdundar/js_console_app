import globals from "globals";
import pluginJs from "@eslint/js";
import js from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: { 
      globals: globals.node,
      ecmaVersion: 2021,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      }, 
    },
  },
  pluginJs.configs.recommended, 
  {
    rules: {
      ...js.configs.recommended.rules,
    }
  }
];
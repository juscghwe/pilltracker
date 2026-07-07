import js from "@eslint/js";
import globals from "globals";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import { jsdoc } from "eslint-plugin-jsdoc";
import { fileURLToPath } from "node:url";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

const eslintConfig = defineConfig([
  includeIgnoreFile(gitignorePath, {
    gitignoreResolution: true,
    name: "Imported .gitignore patterns",
  }),

  {
    ignores: ["package-lock.json", ".devcontainer/devcontainer-lock.json"],
  },

  js.configs.recommended,

  jsdoc({
    config: "flat/recommended-typescript-flavor",
    files: ["backend/**/*.{js,mjs}", "scripts/**/*.mjs", "eslint.config.js"],
    rules: {
      "jsdoc/tag-lines": "off",

      "jsdoc/require-jsdoc": [
        "warn",
        {
          publicOnly: {
            esm: true,
            cjs: false,
            window: false,
          },
          require: {
            FunctionDeclaration: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
            MethodDefinition: false,
            ClassExpression: false,
          },
          contexts: ["ExportNamedDeclaration > VariableDeclaration", "ExportDefaultDeclaration"],
          enableFixer: false,
        },
      ],
    },
  }),

  jsdoc({
    config: "flat/recommended-typescript-flavor",
    files: ["frontend/**/*.{js,jsx,mjs}"],
    rules: {
      "jsdoc/require-jsdoc": "off",
      "jsdoc/tag-lines": "off",
    },
  }),

  {
    files: ["backend/**/*.{js,mjs}", "scripts/**/*.mjs", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        fetch: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  {
    files: ["frontend/**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        fetch: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
]);

export default eslintConfig;

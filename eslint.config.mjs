import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      parser: tsParser,
      sourceType: "module",
      globals: {
        AbortController: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        DOMException: "readonly",
        fetch: "readonly",
        RequestInit: "readonly",
        Response: "readonly",
        setTimeout: "readonly",
        URL: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
];

import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  {
    ignores: ["node_modules", ".next", "dist"],
  },

  {
    files: ["**/*.{ts,tsx,js,jsx}"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
    },

    rules: {
      // Next recommended
      ...nextPlugin.configs.recommended.rules,

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Automatically remove unused imports
      "unused-imports/no-unused-imports": "error",

      // Disable TS unused-vars since unused-imports handles it
      "@typescript-eslint/no-unused-vars": "off",

      // Next.js image rule off
      "@next/next/no-img-element": "off",
    },
  },
];

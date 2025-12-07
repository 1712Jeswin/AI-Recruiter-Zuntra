// eslint.config.js

import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import tailwindPlugin from "eslint-plugin-tailwindcss";
import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: ["node_modules", "dist", ".next"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
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
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
      tailwindcss: tailwindPlugin,
    },
    rules: {
      // Typescript
      ...tsPlugin.configs.recommended.rules,

      // React
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // A11y
      ...jsxA11yPlugin.configs.recommended.rules,

      // Import
      ...importPlugin.configs.recommended.rules,

      // Tailwind
      ...tailwindPlugin.configs.recommended.rules,

      // Next.js (flat config)
      ...nextConfig.rules,

      // Prettier override
      ...prettierConfig.rules,

      // Custom overrides
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "off",
      "import/no-unresolved": "off",
      "tailwindcss/no-custom-classname": "off",
    },
  },
];

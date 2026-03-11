import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "node_modules/**", ".history/**"],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    rules: {
      // Allow `any` in legacy and integration code where strict typing is more expensive.
      "@typescript-eslint/no-explicit-any": "off",
      // Ignore unused variables for common Express/handler args and intentionally unused values.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^(_|next$|res$|err$|result$|data$)",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];

// @ts-check
import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import * as esImport from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["eslint.config.mjs", "node_modules", "dist"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: "module",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      import: esImport,
      prettier: prettierPlugin,
    },
  },
  {
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },
  {
    rules: {
      "import/newline-after-import": ["error"],
      "import/extensions": "off",
      "import/prefer-default-export": "off",
      "import/no-extraneous-dependencies": "off",
      "import/no-duplicates": "error",
      "no-duplicate-imports": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-shadow": "warn",
      "@typescript-eslint/no-loop-func": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/no-use-before-define": "warn",
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js built-ins (fs, path, etc.)
            "external", // npm packages (nestjs, typeorm, etc.)
            "internal", // Path aliases (@src/...)
            "parent", // ../
            "sibling", // ./
            "index", // index.ts
            "object",
            "type",
          ],
          pathGroups: [
            // 1. Framework First (NestJS)
            {
              pattern: "@nestjs/**",
              group: "external",
              position: "before",
            },

            // 2. Configuration
            {
              pattern: "config/**",
              group: "internal",
              position: "before",
            },

            // 3. Core Definitions (Constants, Enums, Types, DTOs)
            {
              pattern: "{constants/**,enums/**,types/**,dtos/**}",
              group: "internal",
              position: "before",
            },

            // 4. Core Utilities & Helpers (Decorators, Utils, Validators, Pipes)
            {
              pattern: "{utils/**,decorators/**,pipes/**,validators/**,fonts/**}",
              group: "internal",
              position: "before",
            },

            // 5. Request Lifecycle (Guards, Filters, Interceptors, Middlewares)
            {
              pattern: "{guards/**,filters/**,interceptors/**,middlewares/**}",
              group: "internal",
              position: "before",
            },

            // 6. Database Layer
            {
              pattern: "{database/**,migrations/**,repsoitories/**,entities/**}",
              group: "internal",
              position: "before",
            },
            {
              pattern: "modules/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "{services/**,cron/**,queue/**,consumers/**}",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          "newlines-between": "always", // Adds a blank line between groups for readability
        },
      ],
      "prettier/prettier": ["error", { singleQuote: false, semi: true }],
      "no-console": "error",
      "no-var": "error",
      "no-nested-ternary": "warn",
      "no-unneeded-ternary": "warn",
      "no-empty-pattern": "error",
      "no-restricted-exports": "off",
      "object-shorthand": "error",
      "prefer-destructuring": "warn",
      camelcase: "off", // off because of typeorm exiting entities
      "max-params": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@cspell/spellchecker": [
        "error",
        {
          checkComments: true,
          checkStrings: true,
          checkIdentifiers: true,
          checkStringTemplates: true,
          autoFix: true,
        },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      "import/no-cycle": "error", // Critical for NestJS
      "@typescript-eslint/no-floating-promises": "error", // Catches missing 'await'
      "@typescript-eslint/await-thenable": "error", // Prevents unnecessary awaits
      "max-lines-per-function": ["warn", { max: 100, skipBlankLines: true, skipComments: true }], // Suggest breaking up large functions
      complexity: ["warn", { max: 10 }], // Suggest refactoring if logic gets too nested
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/prefer-nullish-coalescing": "error", // Use '??' instead of '||' for strictness
      "@typescript-eslint/prefer-optional-chain": "error", // Use 'a?.b' instead of 'a && a.b'
      eqeqeq: ["error", "always"], // Enforce === over ==
      "no-param-reassign": "error", // Don't mutate function arguments
      "@typescript-eslint/naming-convention": "off",
      "spaced-comment": [
        "error",
        "always",
        {
          markers: ["/"],
        },
      ],
      "no-warning-comments": [
        "warn",
        {
          terms: ["todo", "fixme", "xxx"],
          location: "start",
        },
      ],
      "no-inline-comments": "off", // Turn ON if you want to force comments to their own line
    },
  },
);

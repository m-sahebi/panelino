/** @type {import("eslint").Linter.Config} */
const config = {
  plugins: ["prettier", "import", "unused-imports", "tailwindcss"],
  extends: [
    "next/core-web-vitals",
    "airbnb-base",
    "prettier",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  rules: {
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        // varsIgnorePattern: "^_",
        args: "after-used",
        // argsIgnorePattern: "^_",
      },
    ],
    "import/extensions": "off",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["sibling", "parent"],
          "index",
          "unknown",
        ],
        "newlines-between": "never",
        alphabetize: {
          order: "asc",
          caseInsensitive: false,
        },
      },
    ],
    "tailwindcss/classnames-order": [
      "error",
      {
        callees: ["cn", "clsx"],
        removeDuplicates: true,
      },
    ],
  },
  overrides: [
    {
      files: "**/*.+(ts|tsx|js|jsx)",
      extends: ["plugin:prettier/recommended"],
      rules: {
        "import/prefer-default-export": "off",
        "import/no-named-default": "off",
        "func-names": "off",
        "no-underscore-dangle": "off",
        "no-restricted-exports": "off",
        camelcase: "off",
        "prettier/prettier": [
          "warn",
          { usePrettierrc: true, endOfLine: "auto" },
        ],
      },
    },
  ],
};

module.exports = config;

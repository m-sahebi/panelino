const path = require("path");

/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: path.join(__dirname, "tsconfig.json"),
  },
  plugins: ["@typescript-eslint", "unused-imports"],
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  rules: {
    "import/extensions": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
  overrides: [
    {
      parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
      },
      files: ["*.ts", "*.tsx"],
      extends: ["plugin:@typescript-eslint/recommended-requiring-type-checking"],
      rules: {
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/require-await": "off",
        "import/prefer-default-export": "off",
        "import/no-named-default": "off",
        "func-names": "off",
        "no-underscore-dangle": "off",
        "no-restricted-exports": "off",
        "react/self-closing-comp": [
          "error",
          {
            component: true,
            html: true,
          },
        ],
        "react/jsx-curly-brace-presence": [
          "error",
          {
            props: "never",
            children: "never",
            propElementValues: "always",
          },
        ],
        "react/function-component-definition": [
          "error",
          { namedComponents: "function-declaration", unnamedComponents: "arrow-function" },
        ],
        "react/jsx-no-duplicate-props": ["error"],
        "react/jsx-boolean-value": ["error", "never"],
        "react/jsx-no-useless-fragment": ["error"],
        "react/no-unstable-nested-components": ["error"],
        "react/jsx-uses-vars": ["warn"],
        camelcase: "off",
      },
    },
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};

module.exports = config;

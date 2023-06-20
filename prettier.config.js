/** @type {import("prettier").Config} */
module.exports = {
  printWidth: 100,
  trailingComma: "all",
  tailwindFunctions: ["clsx", "cn"],
  importOrder: ["<BUILTIN_MODULES>", "<THIRD_PARTY_MODULES>", "^~/(.*)$", "^[.]"],
  importOrderTypeScriptVersion: "5.0.0",
  plugins: [require("@ianvs/prettier-plugin-sort-imports"), require("prettier-plugin-tailwindcss")],
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.mjs", "*.js"],
      options: {
        parser: "typescript",
        importOrderParserPlugins: ["typescript", "jsx"],
      },
    },
  ],
};

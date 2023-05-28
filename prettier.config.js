/** @type {import("prettier").Config} */
module.exports = {
  printWidth: 90,
  trailingComma: "all",
  tailwindFunctions: ["clsx", "cn"],
  importOrder: ["<BUILTIN_MODULES>", "<THIRD_PARTY_MODULES>", "^~/(.*)$", "^[.]"],
  importOrderTypeScriptVersion: "5.0.0",
  plugins: [require("@ianvs/prettier-plugin-sort-imports"), require("prettier-plugin-tailwindcss")],
};

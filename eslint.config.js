const js = require("@eslint/js");
const globals = require("globals");

const JS_FILES = ["**/*.{js,mjs,cjs}"];

module.exports = [
  js.configs.recommended,
  {
    files: JS_FILES,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      semi: ["warn", "always"],
      "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
      "no-use-before-define": ["error", { functions: false }],
      "no-console": "off",
    },
  },
];
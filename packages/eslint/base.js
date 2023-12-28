/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ["@callstack"],
  plugins: ["unused-imports"],
  env: {
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  ignorePatterns: [
    "**/.eslintrc.cjs",
    "**/*.config.js",
    "**/*.config.cjs",
    ".next",
    "dist",
    "pnpm-lock.yaml",
  ],
  reportUnusedDisableDirectives: true,
  rules: {
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
    "react/react-in-jsx-scope": "off",
    "react-native-a11y/has-valid-accessibility-ignores-invert-colors": "off",
    "promise/prefer-await-to-then": "off",
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
};

module.exports = config;

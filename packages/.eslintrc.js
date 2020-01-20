module.exports = {
  root: true,
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  plugins: ["react", "react-native"],
  extends: [
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "plugin:react/all",
    "plugin:react-native/all",
    "plugin:promise/recommended",
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  ignorePatterns: ["generated/"],
  rules: {
    // JavaScript
    "sort-imports": [
      "error",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
    // TypeScript
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    // React - disable auto-formatting (leave it to prettier)
    "react/jsx-indent": "off",
    "react/jsx-indent-props": "off",
    "react/jsx-child-element-spacing": "off",
    "react/jsx-closing-bracket-location": "off",
    "react/jsx-closing-tag-location": "off",
    "react/jsx-curly-newline": "off",
    "react/jsx-first-prop-new-line": "off",
    "react/jsx-max-depth": "off",
    "react/jsx-max-props-per-line": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/jsx-wrap-multilines": "off",
    // React - TypeScript compatibility
    "react/jsx-filename-extension": "off", // Since we have .tsx files, obviously
    // React - other
    "react/destructuring-assignment": "off", // Doesn't actually improve readability
    "react/display-name": "off", // Generally not a problem, just for assorted short-hands where it doesn't matter
    "react/forbid-component-props": "off", // Do allow overriding e.g. style={} since we're not exactly abusing it
    "react/jsx-no-bind": "off", // I believe the code readability outweighs the performance concerns for the time being
    "react/jsx-no-literals": "off", // Literals make code easier to read
    "react/jsx-props-no-spreading": "off", // Fine to use intentionally - get off my lawn
    "react/prop-types": "off", // Not investing in PropTypes at this time
    // ReactNative
    "react-native/no-inline-styles": "off",
    "react-native/no-raw-text": "off",
    "react-native/sort-styles": ["error", "asc", { ignoreClassNames: true }],
  },
};

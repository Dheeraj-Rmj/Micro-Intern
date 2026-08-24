const baseConfig = require("./index.js");

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
const config = [
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@next/next": require("@next/eslint-plugin-next"),
      react: require("eslint-plugin-react"),
      "react-hooks": require("eslint-plugin-react-hooks"),
      "jsx-a11y": require("eslint-plugin-jsx-a11y"),
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // Next.js core rules
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "off",
      "@next/next/no-head-element": "error",

      // React rules
      "react/react-in-jsx-scope": "off", // Not needed with React 19
      "react/prop-types": "off", // TypeScript handles this
      "react/display-name": "error",
      "react/no-unescaped-entities": "error",
      "react/self-closing-comp": "error",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",

      // Accessibility
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/interactive-supports-focus": "off",
      "jsx-a11y/click-events-have-key-events": "off",
    },
  },
];

module.exports = config;

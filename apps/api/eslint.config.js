const baseConfig = require("@microintern/config/eslint/node.js");

module.exports = [
  ...baseConfig,
  {
    ignores: ["seed_admins.ts"]
  }
];

/* eslint-env node */
const sharedPlugins = ["prettier"];
const sharedRuleExtends = ["eslint:recommended"];
const sharedRulePrettierExtends = ["prettier"];

module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: [...sharedPlugins],
  extends: [...sharedRuleExtends, ...sharedRulePrettierExtends],
  settings: {
    react: {
      version: "detect"
    }
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      plugins: [...sharedPlugins, "@typescript-eslint"],
      extends: [
        ...sharedRuleExtends,
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        ...sharedRulePrettierExtends,
        "prettier/@typescript-eslint"
      ]
    }
  ]
};

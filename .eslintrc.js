/* eslint-env node */
const sharedPlugins = ["react", "prettier"];
const sharedRuleExtends = ["eslint:recommended", "plugin:react/recommended"];
const sharedRulePrettierExtends = ["prettier", "prettier/react"];

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

/* eslint-env node */
const babelConfig = require("./babel.config");

module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  restoreMocks: true,
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.json",
      babelConfig
    }
  }
};

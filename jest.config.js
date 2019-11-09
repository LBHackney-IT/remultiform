/* eslint-env node */
module.exports = {
  preset: "ts-jest",
  setupFiles: ["fake-indexeddb/auto"],
  restoreMocks: true,
  testMatch: ["**/*.+(spec|test).ts?(x)"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/examples/"],
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.json"
    }
  }
};

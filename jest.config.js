/* eslint-env node */
module.exports = {
  preset: "ts-jest",
  setupFiles: ["fake-indexeddb/auto"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/examples/"],
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.json"
    }
  }
};

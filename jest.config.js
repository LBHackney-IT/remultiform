/* eslint-env node */
module.exports = {
  preset: "ts-jest",
  setupFiles: ["fake-indexeddb/auto"],
  snapshotSerializers: ["<rootDir>/src/__tests__/serializers/pathSerializer"],
  restoreMocks: true,
  testMatch: ["**/*.+(spec|test).ts?(x)"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/examples/"],
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.json"
    }
  }
};

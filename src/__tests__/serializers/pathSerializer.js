/* eslint-env node */
const { resolve } = require("path");

const rootDirName = resolve(__dirname, "..", "..", "..");

module.exports = {
  test(value) {
    return value && typeof value === "string" && value.includes(rootDirName);
  },

  print(value, serialize) {
    return serialize(value.replace(new RegExp(rootDirName, "g"), "<rootDir>"));
  },
};

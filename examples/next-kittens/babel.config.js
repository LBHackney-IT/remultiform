/* eslint-env node */
module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          remultiform: ["../../dist/index"]
        }
      }
    ]
  ]
};

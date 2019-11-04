/* eslint-env node */
module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["."],
        alias: {
          remultiform: "../../dist/module"
        }
      }
    ]
  ]
};

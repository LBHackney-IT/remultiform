/* eslint-env node */
const babel = require("rollup-plugin-babel");
const typescript = require("rollup-plugin-typescript2");

const pkg = require("./package.json");

module.exports = {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs"
    },
    {
      file: pkg.module,
      format: "es"
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: [
    typescript({
      typescript: require("typescript")
    }),
    babel({
      extensions: [".ts", ".tsx"],
      exclude: "**/node_modules/**/*"
    })
  ]
};

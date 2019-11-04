/* eslint-env node */
const babel = require("rollup-plugin-babel");
const del = require("rollup-plugin-delete");
const resolve = require("rollup-plugin-node-resolve");
const progress = require("rollup-plugin-progress");
const typescript = require("rollup-plugin-typescript2");

const pkg = require("./package.json");
const tsconfig = require("./tsconfig.json");

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
    del({
      targets: ["dist/**/*"],
      verbose: true
    }),
    progress({
      clearLine: false
    }),
    resolve(),
    typescript({
      typescript: require("typescript"),
      tsconfigOverride: {
        exclude: [
          ...tsconfig.exclude,
          "**/__tests__/**/*",
          "**/*.spec.*",
          "**/*.test.*"
        ]
      }
    }),
    babel({
      extensions: [".ts", ".tsx"],
      exclude: "**/node_modules/**/*"
    })
  ]
};

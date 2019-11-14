/* eslint-env node */
const { dirname } = require("path");
const babel = require("rollup-plugin-babel");
const del = require("rollup-plugin-delete");
const { default: multiInput } = require("rollup-plugin-multi-input");
const resolve = require("rollup-plugin-node-resolve");
const progress = require("rollup-plugin-progress");
const typescript = require("rollup-plugin-typescript2");

const pkg = require("./package.json");
const tsconfig = require("./tsconfig.json");

module.exports = [
  {
    input: ["src/**/*.ts?(x)", "!**/__*__/**/*", "!**/*.(spec|test).*"],
    output: [
      {
        dir: dirname(pkg.main),
        format: "cjs"
      },
      {
        dir: dirname(pkg.module),
        format: "es"
      }
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      multiInput(),
      del({
        targets: [dirname(pkg.main), dirname(pkg.module)],
        verbose: true
      }),
      progress({
        clearLine: false
      }),
      resolve(),
      typescript({
        typescript: require("typescript"),
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            declarationDir: dirname(pkg.types)
          },
          exclude: [
            ...tsconfig.exclude,
            "**/__*__/**/*",
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
  }
];

import json from "@rollup/plugin-json";

export default {
  input: "index.js",
  output: {
    file: "index.cjs",
    format: "cjs",
    exports: "named",
  },
  external: [
    "fs",
    "path",
    "markdown-it",
    "mkdirp",
    "markdown-it-checkbox",
    "markdown-it-attrs",
    "markdown-it-anchor",
    "express",
  ],
  plugins: [json()],
};

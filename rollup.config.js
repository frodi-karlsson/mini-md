import json from "@rollup/plugin-json";

export default {
  input: "index.js",
  output: {
    file: "index.cjs",
    format: "cjs",
  },
  plugins: [json()],
};

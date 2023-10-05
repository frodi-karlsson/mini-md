#!/usr/bin/env node

import * as mkdirp from "mkdirp";
import fs from "fs";
import path from "path";

const miniMdLocation = path.dirname(process.argv[1]);
const userLocation = process.cwd();
const configMapExists = fs.existsSync(path.join(userLocation, "config"));
if (!configMapExists) {
  mkdirp.sync(path.join(userLocation, "config"));
}
const miniMdDefaultConfig = fs.readFileSync(
  path.join(miniMdLocation, "config", "default.json"),
  "utf8"
);
const hasForceFlag = process.argv.includes("-f");
const userConfigExists = fs.existsSync(
  path.join(userLocation, "config", "default.json")
);
if (userConfigExists && !hasForceFlag) {
  console.error(
    "User config already exists. Use -f to force overwrite. Exiting..."
  );
  process.exit(1);
} else {
  fs.writeFileSync(
    path.join(userLocation, "config", "default.json"),
    miniMdDefaultConfig
  );
}

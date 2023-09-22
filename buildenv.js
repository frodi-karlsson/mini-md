import * as mkdirp from "mkdirp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = __dirname.split("node_modules")[0].slice(0, -1);

console.log("Creating config directory and default config file");
console.log("Project root: " + projectRoot);
console.log("Directory of this script: " + __dirname);

const exists = fs.existsSync(projectRoot + "/config");
if (exists) {
  console.info("Config directory already exists: " + projectRoot + "/config");
} else {
  mkdirp.sync(projectRoot + "/config");
}
const defaultExists = fs.existsSync(projectRoot + "/config/default.json");
if (defaultExists) {
  console.info(
    "Default config already exists: " + projectRoot + "/config/default.json"
  );
} else {
  const defaultConfig = fs.readFileSync(
    __dirname + "/config/default.json",
    "utf8"
  );
  fs.writeFileSync(projectRoot + "/config/default.json", defaultConfig);
}

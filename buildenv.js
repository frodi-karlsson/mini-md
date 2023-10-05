import * as mkdirp from "mkdirp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = __dirname.split("node_modules")[0];

console.log("Creating config directory and default config file");
console.log("Project root: " + projectRoot);
console.log("Directory of this script: " + __dirname);

const exists = fs.existsSync(path.join(projectRoot, "config"));
if (exists) {
  console.info("Config directory already exists: " + projectRoot + "/config");
} else {
  mkdirp.sync(path.join(projectRoot, "config"));
}
const defaultExists = fs.existsSync(
  path.join(projectRoot, "config", "default.json")
);
if (defaultExists) {
  console.info(
    "Default config already exists: " + projectRoot + "/config/default.json"
  );
} else {
  const defaultConfig = fs.readFileSync(
    path.join(__dirname, "config", "default.json"),
    "utf8"
  );
  fs.writeFileSync(
    path.join(projectRoot, "config", "default.json"),
    defaultConfig
  );
}

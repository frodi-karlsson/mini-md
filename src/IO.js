import defaultConfig from "../config/default.json" assert { type: "json" };
import projectConfig from "../config/project.json" assert { type: "json" };
import fs from "fs";
import path from "path";
import Helpers from "./helpers.js";

/**
 * Handles all IO operations
 */
export default class IO {
  /**
   * The value of __dirname for the user's project
   * @type {string}
   * @private
   */
  _userDirPath;

  /**
   * Each directory value from the user's config or undefined if not set
   * @type {Record<keyof defaultConfig, string>}
   * @private
   */
  _userDirs;

  /**
   * Each directory value from the default config
   * @type {Record<keyof defaultConfig, string>}
   * @private
   */
  _projectDirs;

  /**
   * Each path value or undefined if not set
   * @type {Record<keyof defaultConfig, string>}
   * @private
   */
  _userPaths;

  /**
   * Each path value from the default config
   * @type {Record<keyof defaultConfig, string>}
   * @private
   */
  _projectPaths;

  /**
   * User's config file
   * @type {defaultConfig}
   */
  _userConfig;

  /**
   * Project's config file
   * @type {defaultConfig}
   */
  _projectConfig;

  /**
   * The value of __dirname for the package
   * @type {string}
   * @private
   */
  _projectDirPath;

  constructor() {
    this._projectDirPath = path.join(process.cwd(), "node_modules", "mini-md");
    this._userDirPath = process.cwd();
    this.findConfig();
    this.fillDirs();
    this.fillPaths();
  }

  /**
   * Checks that a file or directory exists
   * @param {string} checkPath The path to check
   * @returns {boolean}
   */
  exists(checkPath) {
    const exists = fs.existsSync(checkPath);

    return exists;
  }

  /**
   * Finds config file for the user's project. Should be located in {projectRoot}/config/*.json
   */
  findConfig() {
    const configPath = path.join(this._userDirPath, "config");
    const configFiles = fs.readdirSync(configPath);
    const config = configFiles.find((file) => file.endsWith(".json"));
    if (!config) {
      throw new Error("No config file found in " + configPath);
    }
    const configContent = fs.readFileSync(
      path.join(this._userDirPath, "config", config),
      "utf8"
    );
    this._userConfig = defaultConfig;
    Helpers.assign(this._userConfig, JSON.parse(configContent));
    this._projectConfig = projectConfig;
  }

  /**
   * Fills the _dirs object with the directories specified in the config
   * Uses user values if set, otherwise uses default values
   * @private
   * @returns {void}
   */
  fillDirs() {
    const userDirs = {};
    const projectDirs = {};
    Object.keys(this._userConfig).forEach(
      (key) => (userDirs[key] = this._userConfig[key].dir)
    );
    Object.keys(projectConfig).forEach(
      (key) => (projectDirs[key] = projectConfig[key].dir)
    );
    this._userDirs = /** @type {Record<keyof defaultConfig, string>} */ (
      userDirs
    );
    this._projectDirs = /** @type {Record<keyof defaultConfig, string>} */ (
      projectDirs
    );
  }

  /**
   * Fills the _paths object with the paths specified in the config
   * Uses user values if set, otherwise uses default values
   * @private
   * @returns {void}
   */
  fillPaths() {
    const userPaths = {};
    const projectPaths = {};
    Object.keys(this._userConfig).forEach(
      (key) => (userPaths[key] = this._userConfig[key].path)
    );
    Object.keys(projectConfig).forEach(
      (key) => (projectPaths[key] = projectConfig[key].path)
    );
    this._userPaths = /** @type {Record<keyof defaultConfig, string>} */ (
      userPaths
    );
    this._projectPaths = /** @type {Record<keyof defaultConfig, string>} */ (
      projectPaths
    );
  }

  /**
   * Retrieves a dir value from the config
   * @param {keyof defaultConfig} dir The directory to retrieve
   * @param {"user" | "project"} [type] The type of directory to search
   * @returns {string} The directory
   */
  getDir(dir, type = "user") {
    const dirs = this[`_${type}Dirs`];
    if (dirs[dir]) {
      return dirs[dir];
    } else {
      throw new Error("No directory found for " + dir);
    }
  }

  /**
   * Retrieves a path value from the config
   * @param {keyof defaultConfig} configPath The path to retrieve
   * @param {"user" | "project"} [type] The type of directory to search
   * @returns {string} The path
   */
  getPath(configPath, type = "user") {
    const paths = this[`_${type}Paths`];
    if (paths[configPath]) {
      return paths[configPath];
    } else {
      throw new Error("No path found for " + configPath + " in " + type);
    }
  }

  /**
   * Reads a directory recursively and returns a list of all files
   * @param {string} dirPath The path to read
   */
  readDirRecursive(dirPath, originalPath = dirPath, files = []) {
    fs.readdirSync(dirPath, { withFileTypes: true }).forEach((dirent) => {
      if (dirent.isDirectory()) {
        files = this.readDirRecursive(
          path.join(dirPath, dirent.name),
          originalPath,
          files
        );
      } else {
        files.push(path.join(dirPath.replace(originalPath, ""), dirent.name));
      }
    });
    return files;
  }

  /**
   * Returns a list of every file in a directory that exists in the config
   * @param {keyof defaultConfig} dir The directory to search
   * @param {"user" | "project"} [type] The type of directory to search
   * @returns {string[]} The list of files
   */
  getFiles(dir, type = "user") {
    if (["Templates", "Scripts"].includes(dir) && type === "project") {
      return [];
    }
    const dirs = this[`_${type}Dirs`];
    const dirPath = this[`_${type}DirPath`]; // _userDirPath or _projectDirPath
    if (dirs[dir]) {
      if (this.exists(path.join(dirPath, dirs[dir]))) {
        return this.readDirRecursive(path.join(dirPath, dirs[dir]));
      } else {
        Helpers.warn("Directory does not exist: " + dir, "in", type);
        Helpers.warn("Expected path:", path.join(dirPath, dirs[dir]));
        return [];
      }
    } else {
      throw new Error("No directory found for " + dir);
    }
  }

  /**
   * Returns a full directory path
   * @param {keyof defaultConfig} dir The directory to search
   * @param {"user" | "project"} [type] The type of directory to search
   * @returns {string} The path
   */
  getDirPath(dir, type = "user") {
    const dirs = this[`_${type}Dirs`];
    const dirPath = this[`_${type}DirPath`];
    if (dirs[dir]) {
      return path.join(dirPath, dirs[dir]);
    } else {
      throw new Error("No directory found for " + dir);
    }
  }

  /**
   * Returns the content of a file
   * @param {string} file The file to read
   * @param {keyof defaultConfig} dir The directory to search
   * @param {"user" | "project"} [type] The type of directory to search
   * @returns {string} The content of the file
   */
  getFileContent(file, dir, type = "user") {
    const dirs = this[`_${type}Dirs`];
    const dirPath = this[`_${type}DirPath`];
    if (dirs[dir]) {
      return fs.readFileSync(path.join(dirPath, dirs[dir], file), "utf8");
    } else {
      throw new Error("No directory found for " + dir);
    }
  }
}

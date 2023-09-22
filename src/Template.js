import path from "path";
import fs from "fs";

export default class Template {
  _name;
  _path;
  _content;

  /**
   * @constructor
   * @param {string} name The name of the template
   * @param {string} path The path to the template
   */
  constructor(name, path) {
    this._name = name;
    this._path = path;
    let content;
    try {
      content = fs.readFileSync(this.path, "utf8");
    } catch (err) {
      console.error(err);
      throw err;
    }

    this._content = content;
  }

  /**
   * The name of the template. This is the filename without the extension
   * @returns {string}
   */
  get name() {
    return this._name;
  }

  /**
   * The path to the template
   * @returns {string}
   */
  get path() {
    return this._path;
  }

  /**
   * The content of the template
   * @returns {string}
   */
  get content() {
    return this._content;
  }
}

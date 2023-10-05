export default class Template {
  _name;
  _content;

  /**
   * @constructor
   * @param {string} name The name of the template
   * @param {string} content The content of the template
   */
  constructor(name, content) {
    this._name = name;
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
   * The content of the template
   * @returns {string}
   */
  get content() {
    return this._content;
  }
}

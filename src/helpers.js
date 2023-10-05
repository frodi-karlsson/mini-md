export default class Helpers {
  /**
   * Prints a warning to the console in yellow
   * @param  {...any} data
   */
  static warn(...data) {
    const ansiYellow = "\u001b[33m";
    const ansiReset = "\u001b[0m";
    console.warn(ansiYellow, ...data, ansiReset);
  }

  /**
   * Prints a success message to the console in green
   * @param  {...any} data
   */
  static success(...data) {
    const ansiGreen = "\u001b[32m";
    const ansiReset = "\u001b[0m";
    console.log(ansiGreen, ...data, ansiReset);
  }

  /**
   * Prints an error message to the console in red
   * @param  {...any} data
   */
  static error(...data) {
    const ansiRed = "\u001b[31m";
    const ansiReset = "\u001b[0m";
    console.error(ansiRed, ...data, ansiReset);
  }

  /**
   * Recursively assigns the values of an object to another object
   * @param {Record<string, any>} obj The object to assign to
   * @param {Record<string, any>} values The values to assign
   * @returns {void}
   */
  static assign(obj, values) {
    for (const key in values) {
      if (Array.isArray(values[key])) {
        obj[key] = [...values[key]];
      } else if (typeof values[key] === "object") {
        this.assign(obj[key], values[key]);
      } else {
        obj[key] = values[key];
      }
    }
  }
}

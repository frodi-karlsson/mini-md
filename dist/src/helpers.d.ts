export default class Helpers {
    /**
     * Prints a warning to the console in yellow
     * @param  {...any} data
     */
    static warn(...data: any[]): void;
    /**
     * Prints a success message to the console in green
     * @param  {...any} data
     */
    static success(...data: any[]): void;
    /**
     * Prints an error message to the console in red
     * @param  {...any} data
     */
    static error(...data: any[]): void;
    /**
     * Recursively assigns the values of an object to another object
     * @param {Record<string, any>} obj The object to assign to
     * @param {Record<string, any>} values The values to assign
     * @returns {void}
     */
    static assign(obj: Record<string, any>, values: Record<string, any>): void;
}

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
    /**
     * "Splices" a string in the same way that Array.prototype.splice() does
     * @param {string} str The string to splice
     * @param {number} index The index to start splicing at
     * @param {number} count The number of characters to remove
     * @param {string} [add] The string to add
     * @returns {string} The spliced string
     */
    static spliceSlice(str: string, index: number, count: number, add?: string): string;
}

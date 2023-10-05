export default class Template {
    /**
     * @constructor
     * @param {string} name The name of the template
     * @param {string} content The content of the template
     */
    constructor(name: string, content: string);
    _name: string;
    _content: string;
    /**
     * The name of the template. This is the filename without the extension
     * @returns {string}
     */
    get name(): string;
    /**
     * The content of the template
     * @returns {string}
     */
    get content(): string;
}

/**
 * Express engine for serving MiniMD templates
 */
export default class MiniMD {
    /**
     * @type {Template[]}
     */
    _templates: Template[];
    /**
     * @typedef {("all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" | "use")} Method
     * @typedef {[string, string] | [string, string, Method]} Route
     */
    /**
     * @type {Route[]}
     */
    _routes: ([string, string] | [string, string, "all" | "head" | "use" | "options" | "get" | "post" | "put" | "delete" | "patch"])[];
    /**
     * @type {MarkdownIt}
     */
    _md: MarkdownIt;
    /**
     * @type {IO}
     */
    io: IO;
    /**
     * @type {express.Application}
     */
    app: express.Application;
    /**
     * @typedef {Object} Handler
     * @property {string} path
     * @property {express.RequestHandler} handler
     * @property {Method} method
     */
    /**
     * @type {Handler[]}
     */
    _handlers: {
        path: string;
        handler: express.RequestHandler;
        method: "all" | "head" | "use" | "options" | "get" | "post" | "put" | "delete" | "patch";
    }[];
    /**
     * @typedef {(app: express.Application) => void} Modifier
     */
    /**
     * @type {Modifier[]}
     */
    _modifiers: ((app: express.Application) => void)[];
    /**
     * The markdown parser
     * @param {express.Application} app The express app
     */
    /**
     * Adds the given routes to the app.
     * @param {Route[]} routes These are in the format [ route, templateName, method = "get" ]
     * @returns {void}
     */
    addRoutes(routes: ([string, string] | [string, string, "all" | "head" | "use" | "options" | "get" | "post" | "put" | "delete" | "patch"])[]): void;
    /**
     * Adds a middleware handler to the express app
     * @private
     * @param {Method} method The method to add
     * @param {string | express.RequestHandler} path The path to add
     * @param {express.RequestHandler=} handler The handler to add
     * @returns {void}
     */
    private addHandler;
    /**
     * @overload
     * @param {string} path The path to add
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    use(path: string, handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    use(handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {string} path The path to add
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    get(path: string, handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    get(handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {string} path The path to add
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    post(path: string, handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    post(handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {string} path The path to add
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    put(path: string, handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    put(handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {string} path The path to add
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    delete(path: string, handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    delete(handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {string} path The path to add
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    patch(path: string, handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    patch(handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {string} path The path to add
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    options(path: string, handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    options(handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {string} path The path to add
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    head(path: string, handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    head(handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {string} path The path to add
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    all(path: string, handler: express.RequestHandler): void;
    /**
     * @overload
     * @param {express.RequestHandler} handler The handler to add
     * @returns {void}
     */
    all(handler: express.RequestHandler): void;
    /**
     * Allows modification of the express app when it is initialized
     * @param {Modifier} callback The callback to run when the express app is initialized
     */
    modify(callback: (app: express.Application) => void): void;
    /**
     * Serves the express app
     * @param {number} port The port to serve on
     * @param {(() => void)=} onListen The callback to run when the server starts listening
     * @returns {void}
     */
    listen(port: number, onListen?: (() => void) | undefined): void;
    /**
     * Read the templates from the directory specified in the config. The templates must be markdown files.
     * @returns {Template[]}
     */
    readTemplates(): Template[];
    /**
     * Initialize the IO class
     * @private
     * @returns {void}
     */
    private initIO;
    /**
     * Initialize the templates
     * @private
     * @returns {void}
     */
    private initTemplates;
    /**
     * Initialize the markdown parser
     * @private
     * @returns {void}
     */
    private initMd;
    /**
     * Do all the parsing and rendering for the given template
     * @param {string} name The name of the template
     * @param {string} route The route that the template is being rendered for
     * @returns {[[string, string], Attrs]} The head and body of the rendered template and the parsed attributes
     */
    handleTemplate(name: string, route: string): [[string, string], {
        title?: string;
        lang?: string;
        schemes?: string[];
        charset?: string;
        description?: string;
        author?: string;
        keywords?: string;
        viewport?: string;
        robots?: string;
        ogTitle?: string;
        ogType?: string;
        ogUrl?: string;
        ogDescription?: string;
        ogImage?: string;
        twitterCard?: string;
        ogLocale?: string;
        ogSiteName?: string;
        twitterImageAlt?: string;
        dependencies?: {
            /**
             * The name of the dependency
             */
            name: string;
            /**
             * The index of the dependency
             */
            index: number;
            /**
             * The length of the dependency
             */
            length: number;
        }[];
    }];
    /**
     * Initialize the express app
     * @private
     * @returns {void}
     */
    private initApp;
    /**
     * Initialize mini-md. This is called automatically when you call MiniMD.listen()
     */
    init(): void;
    /**
     * Register the static assets with the express app
     * @returns {void}
     */
    static(): void;
    /**
     * Get the template with the given name
     * @param {string} name The name of the template
     * @returns {Template}
     */
    getTemplate(name: string): Template;
    /**
     * Render the given template
     * @param {Template} template The template to render
     * @param {Dependency[]} dependencies The dependencies to inject
     * @param {Attrs} attrs The attributes to add to the head
     * @returns {[string, string]} The rendered template and the head
     */
    renderTemplate(template: Template, dependencies: {
        /**
         * The name of the dependency
         */
        name: string;
        /**
         * The index of the dependency
         */
        index: number;
        /**
         * The length of the dependency
         */
        length: number;
    }[], attrs: {
        title?: string;
        lang?: string;
        schemes?: string[];
        charset?: string;
        description?: string;
        author?: string;
        keywords?: string;
        viewport?: string;
        robots?: string;
        ogTitle?: string;
        ogType?: string;
        ogUrl?: string;
        ogDescription?: string;
        ogImage?: string;
        twitterCard?: string;
        ogLocale?: string;
        ogSiteName?: string;
        twitterImageAlt?: string;
        dependencies?: {
            /**
             * The name of the dependency
             */
            name: string;
            /**
             * The index of the dependency
             */
            index: number;
            /**
             * The length of the dependency
             */
            length: number;
        }[];
    }): [string, string];
    /**
     * Injects the dependencies into the rendered template
     * @param {string} rendered The rendered template
     * @param {Dependency[]} dependencies The dependencies to inject
     * @returns {[string, string[]]} The rendered template and the tags to add to the head
     */
    addDependencies(rendered: string, dependencies: {
        /**
         * The name of the dependency
         */
        name: string;
        /**
         * The index of the dependency
         */
        index: number;
        /**
         * The length of the dependency
         */
        length: number;
    }[]): [string, string[]];
    /**
     * Builds the head of the rendered template
     * @param {string} components The components to add
     * @param {string} styles The styles to add
     * @param {string} scripts The scripts to add
     * @param {Attrs} attrs The attributes to add
     * @param {string[]} depHeads The dependency heads to add
     * @returns {string}
     */
    buildHead(components: string, styles: string, scripts: string, attrs: {
        title?: string;
        lang?: string;
        schemes?: string[];
        charset?: string;
        description?: string;
        author?: string;
        keywords?: string;
        viewport?: string;
        robots?: string;
        ogTitle?: string;
        ogType?: string;
        ogUrl?: string;
        ogDescription?: string;
        ogImage?: string;
        twitterCard?: string;
        ogLocale?: string;
        ogSiteName?: string;
        twitterImageAlt?: string;
        dependencies?: {
            /**
             * The name of the dependency
             */
            name: string;
            /**
             * The index of the dependency
             */
            index: number;
            /**
             * The length of the dependency
             */
            length: number;
        }[];
    }, depHeads: string[]): string;
    /**
     * Wraps content in <mini-md> tags
     * @param {string} content The content to wrap
     * @returns {string} The wrapped content
     */
    wrap(content: string): string;
    /**
     * Wraps the rendered template in a document
     * @param {string} rendered The rendered template
     * @param {Attrs} attrs The parsed attributes
     */
    makeDocument(rendered: string, attrs: {
        title?: string;
        lang?: string;
        schemes?: string[];
        charset?: string;
        description?: string;
        author?: string;
        keywords?: string;
        viewport?: string;
        robots?: string;
        ogTitle?: string;
        ogType?: string;
        ogUrl?: string;
        ogDescription?: string;
        ogImage?: string;
        twitterCard?: string;
        ogLocale?: string;
        ogSiteName?: string;
        twitterImageAlt?: string;
        dependencies?: {
            /**
             * The name of the dependency
             */
            name: string;
            /**
             * The index of the dependency
             */
            index: number;
            /**
             * The length of the dependency
             */
            length: number;
        }[];
    }): string;
    /**
     * Builds the component script tags
     * @returns {string}
     */
    makeComponentTags(): string;
    /**
     * Builds the style tags
     */
    makeStyleTags(): string;
    /**
     * Builds the script tags
     * @param {Template} template The template to build the script tags for
     * @returns {string}
     */
    makeScriptTags(template: Template): string;
    /**
     * Represents a dependency on another template
     * @typedef {Object} Dependency
     * @property {string} name The name of the dependency
     * @property {number} index The index of the dependency
     * @property {number} length The length of the dependency
     */
    /**
     * Represents head attributes that are in a comment on the first line of the template
     * @typedef {Object} Attrs
     * @property {string} [title]
     * @property {string} [lang]
     * @property {string[]} [schemes]
     * @property {string} [charset]
     * @property {string} [description]
     * @property {string} [author]
     * @property {string} [keywords]
     * @property {string} [viewport]
     * @property {string} [robots]
     * @property {string} [ogTitle]
     * @property {string} [ogType]
     * @property {string} [ogUrl]
     * @property {string} [ogDescription]
     * @property {string} [ogImage]
     * @property {string} [twitterCard]
     * @property {string} [ogLocale]
     * @property {string} [ogSiteName]
     * @property {string} [twitterImageAlt]
     * @property {Dependency[]} [dependencies]
     *
     */
    /**
     * Parse the attributes from the template
     * @param {string} template The template to parse
     * @returns {Attrs} The parsed attributes
     */
    parseAttrs(template: string): {
        title?: string;
        lang?: string;
        schemes?: string[];
        charset?: string;
        description?: string;
        author?: string;
        keywords?: string;
        viewport?: string;
        robots?: string;
        ogTitle?: string;
        ogType?: string;
        ogUrl?: string;
        ogDescription?: string;
        ogImage?: string;
        twitterCard?: string;
        ogLocale?: string;
        ogSiteName?: string;
        twitterImageAlt?: string;
        dependencies?: {
            /**
             * The name of the dependency
             */
            name: string;
            /**
             * The index of the dependency
             */
            index: number;
            /**
             * The length of the dependency
             */
            length: number;
        }[];
    };
}
import Template from "./Template.js";
import MarkdownIt from "markdown-it";
import IO from "./IO.js";

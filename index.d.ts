declare module "src/Template" {
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
}
declare module "src/IO" {
    /**
     * Handles all IO operations
     */
    export default class IO {
        /**
         * The value of __dirname for the user's project
         * @type {string}
         * @private
         */
        private _userDirPath;
        /**
         * Each directory value from the user's config or undefined if not set
         * @type {Record<keyof defaultConfig, string>}
         * @private
         */
        private _userDirs;
        /**
         * Each directory value from the default config
         * @type {Record<keyof defaultConfig, string>}
         * @private
         */
        private _projectDirs;
        /**
         * Each path value or undefined if not set
         * @type {Record<keyof defaultConfig, string>}
         * @private
         */
        private _userPaths;
        /**
         * Each path value from the default config
         * @type {Record<keyof defaultConfig, string>}
         * @private
         */
        private _projectPaths;
        /**
         * User's config file
         * @type {defaultConfig}
         */
        _userConfig: {
            Templates: {
                dir: string;
                path: string;
            };
            Styles: {
                dir: string;
                path: string;
            };
            Scripts: {
                dir: string;
                path: string; /**
                 * Handles all IO operations
                 */
            };
            Components: {
                dir: string;
                path: string;
            };
            Assets: {
                dir: string;
                path: string;
            };
        };
        /**
         * Project's config file
         * @type {defaultConfig}
         */
        _projectConfig: {
            Templates: {
                dir: string;
                path: string;
            };
            Styles: {
                dir: string;
                path: string;
            };
            Scripts: {
                dir: string;
                path: string; /**
                 * Handles all IO operations
                 */
            };
            Components: {
                dir: string;
                path: string;
            };
            Assets: {
                dir: string;
                path: string;
            };
        };
        /**
         * The value of __dirname for the package
         * @type {string}
         * @private
         */
        private __filename;
        /**
         * The value of __dirname for the package
         * @type {string}
         * @private
         */
        private _projectDirPath;
        /**
         * Finds the directory of the user's project
         * @returns {string}
         */
        findCallerDir(): string;
        /**
         * Checks that a file or directory exists
         * @param {string} checkPath The path to check
         * @returns {boolean}
         */
        exists(checkPath: string): boolean;
        /**
         * Recursively assigns the values of an object to another object
         * @param {Record<string, any>} obj The object to assign to
         * @param {Record<string, any>} values The values to assign
         * @returns {void}
         */
        assign(obj: Record<string, any>, values: Record<string, any>): void;
        /**
         * Finds config file for the user's project. Should be located in {projectRoot}/config/*.json
         */
        findConfig(): void;
        /**
         * Fills the _dirs object with the directories specified in the config
         * Uses user values if set, otherwise uses default values
         * @private
         * @returns {void}
         */
        private fillDirs;
        /**
         * Fills the _paths object with the paths specified in the config
         * Uses user values if set, otherwise uses default values
         * @private
         * @returns {void}
         */
        private fillPaths;
        /**
         * Retrieves a dir value from the config
         * @param {keyof defaultConfig} dir The directory to retrieve
         * @param {"user" | "project"} [type] The type of directory to search
         * @returns {string} The directory
         */
        getDir(dir: keyof {
            Templates: {
                dir: string;
                path: string;
            };
            Styles: {
                dir: string;
                path: string;
            };
            Scripts: {
                dir: string;
                path: string; /**
                 * Handles all IO operations
                 */
            };
            Components: {
                dir: string;
                path: string;
            };
            Assets: {
                dir: string;
                path: string;
            };
        }, type?: "user" | "project"): string;
        /**
         * Retrieves a path value from the config
         * @param {keyof defaultConfig} configPath The path to retrieve
         * @param {"user" | "project"} [type] The type of directory to search
         * @returns {string} The path
         */
        getPath(configPath: keyof {
            Templates: {
                dir: string;
                path: string;
            };
            Styles: {
                dir: string;
                path: string;
            };
            Scripts: {
                dir: string;
                path: string; /**
                 * Handles all IO operations
                 */
            };
            Components: {
                dir: string;
                path: string;
            };
            Assets: {
                dir: string;
                path: string;
            };
        }, type?: "user" | "project"): string;
        /**
         * Reads a directory recursively and returns a list of all files
         * @param {string} dirPath The path to read
         */
        readDirRecursive(dirPath: string, originalPath?: string, files?: any[]): any[];
        /**
         * Returns a list of every file in a directory that exists in the config
         * @param {keyof defaultConfig} dir The directory to search
         * @param {"user" | "project"} [type] The type of directory to search
         * @returns {string[]} The list of files
         */
        getFiles(dir: keyof {
            Templates: {
                dir: string;
                path: string;
            };
            Styles: {
                dir: string;
                path: string;
            };
            Scripts: {
                dir: string;
                path: string; /**
                 * Handles all IO operations
                 */
            };
            Components: {
                dir: string;
                path: string;
            };
            Assets: {
                dir: string;
                path: string;
            };
        }, type?: "user" | "project"): string[];
        /**
         * Returns a full directory path
         * @param {keyof defaultConfig} dir The directory to search
         * @param {"user" | "project"} [type] The type of directory to search
         * @returns {string} The path
         */
        getDirPath(dir: keyof {
            Templates: {
                dir: string;
                path: string;
            };
            Styles: {
                dir: string;
                path: string;
            };
            Scripts: {
                dir: string;
                path: string; /**
                 * Handles all IO operations
                 */
            };
            Components: {
                dir: string;
                path: string;
            };
            Assets: {
                dir: string;
                path: string;
            };
        }, type?: "user" | "project"): string;
        /**
         * Returns the content of a file
         * @param {string} file The file to read
         * @param {keyof defaultConfig} dir The directory to search
         * @param {"user" | "project"} [type] The type of directory to search
         * @returns {string} The content of the file
         */
        getFileContent(file: string, dir: keyof {
            Templates: {
                dir: string;
                path: string;
            };
            Styles: {
                dir: string;
                path: string;
            };
            Scripts: {
                dir: string;
                path: string; /**
                 * Handles all IO operations
                 */
            };
            Components: {
                dir: string;
                path: string;
            };
            Assets: {
                dir: string;
                path: string;
            };
        }, type?: "user" | "project"): string;
    }
}
declare module "src/MiniMd" {
    /**
     * Express engine for serving MiniMD templates
     */
    export default class MiniMD {
        _templates: any;
        _other__dirname: any;
        /**
         * @typedef {([string, string])[]} routes
         */
        /**
         * @type {routes}
         */
        _routes: [string, string][];
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
         * @property {string} method
         */
        /**
         * @type {Handler[]}
         */
        _handlers: {
            path: string;
            handler: express.RequestHandler;
            method: string;
        }[];
        /**
         * The markdown parser
         * @param {express.Application} app The express app
         */
        /**
         * Adds the given routes
         * @param {routes} routes The routes to add
         * @returns {void}
         */
        addRoutes(routes: [string, string][]): void;
        /**
         * @typedef {("all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" | "use")} Method
         */
        /**
         * Adds a path to the express app
         * @param {Method} method The method to add
         * @param {string} path The path to add
         * @param {express.RequestHandler} handler The handler to add
         * @returns {void}
         */
        addHandler(method: "all" | "head" | "use" | "options" | "get" | "post" | "put" | "delete" | "patch", path: string, handler: express.RequestHandler): void;
        /**
         * Adds a use path to the express app
         * @param {string} path The path to add
         * @param {express.RequestHandler} handler The handler to add
         */
        use(path: string, handler: express.RequestHandler): void;
        /**
         * Adds a get route to the express app
         * @param {string} path The path to add
         * @param {express.RequestHandler} handler The handler to add
         */
        get(path: string, handler: express.RequestHandler): void;
        /**
         * Adds a post route to the express app
         * @param {string} path The path to add
         * @param {express.RequestHandler} handler The handler to add
         */
        post(path: string, handler: express.RequestHandler): void;
        /**
         * Adds a put route to the express app
         * @param {string} path The path to add
         * @param {express.RequestHandler} handler The handler to add
         */
        put(path: string, handler: express.RequestHandler): void;
        /**
         * Adds a delete route to the express app
         * @param {string} path The path to add
         * @param {express.RequestHandler} handler The handler to add
         */
        delete(path: string, handler: express.RequestHandler): void;
        /**
         * Adds a patch route to the express app
         * @param {string} path The path to add
         * @param {express.RequestHandler} handler The handler to add
         */
        patch(path: string, handler: express.RequestHandler): void;
        /**
         * Adds a options handler to the express app
         * @param {string} path The path to add
         * @param {express.RequestHandler} handler The handler to add
         */
        options(path: string, handler: express.RequestHandler): void;
        /**
         * Adds a head handler to the express app
         * @param {string} path The path to add
         * @param {express.RequestHandler} handler The handler to add
         */
        head(path: string, handler: express.RequestHandler): void;
        /**
         * Adds a all handler to the express app
         * @param {string} path The path to add
         * @param {express.RequestHandler} handler The handler to add
         */
        all(path: string, handler: express.RequestHandler): void;
        /**
         * Serves the express app
         * @param {number} port The port to serve on
         * @param {() => void} onListen The callback to run when the server starts listening
         * @returns {void}
         */
        listen(port: number, onListen: () => void): void;
        /**
         * Read the templates from the directory specified in the config. The templates must be markdown files.
         * @returns {Template[]}
         */
        readTemplates(): Template[];
        initIO(): void;
        initTemplates(): void;
        initMd(): void;
        initApp(): void;
        /**
         * Initialize the app
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
            scheme?: string;
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
        }[]): string;
        /**
         * Builds the head of the rendered template
         * @param {string} components The components to add
         * @param {string} styles The styles to add
         * @param {Attrs} attrs The attributes to add
         * @returns {string}
         */
        buildHead(components: string, styles: string, attrs: {
            title?: string;
            lang?: string;
            scheme?: string;
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
            scheme?: string;
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
         * @param {Attrs} attrs The parsed attributes
         */
        makeStyleTags(attrs: {
            title?: string;
            lang?: string;
            scheme?: string;
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
         * @property {string} [scheme]
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
            scheme?: string;
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
    import MarkdownIt from "markdown-it";
    import IO from "src/IO.js";
    import Template from "src/Template.js";
}
declare module "index" {
    namespace _default {
        export { MiniMD };
        export { Template };
    }
    export default _default;
    import MiniMD from "src/MiniMd.js";
    import Template from "src/Template.js";
    export { MiniMD, Template };
}

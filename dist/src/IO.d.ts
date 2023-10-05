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
            path: string;
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
            path: string;
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
    private _projectDirPath;
    /**
     * Checks that a file or directory exists
     * @param {string} checkPath The path to check
     * @returns {boolean}
     */
    exists(checkPath: string): boolean;
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
            path: string;
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
            path: string;
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
            path: string;
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
            path: string;
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
            path: string;
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

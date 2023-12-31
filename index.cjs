'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var MarkdownIt = require('markdown-it');
var markdownItCheckbox = require('markdown-it-checkbox');
var markdownItAttrs = require('markdown-it-attrs');
var markdownitAnchor = require('markdown-it-anchor');
var express = require('express');
var fs = require('fs');
var path = require('path');

class Template {
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

  set content(value) {
    this._content = value;
  }
}

var Templates$1 = {
	dir: "/templates",
	path: "/templates"
};
var Styles$1 = {
	dir: "/styles",
	path: "/styles"
};
var Scripts$1 = {
	dir: "/scripts",
	path: "/scripts"
};
var Components$1 = {
	dir: "/components",
	path: "/components"
};
var Assets$1 = {
	dir: "/assets",
	path: "/assets"
};
var defaultConfig = {
	Templates: Templates$1,
	Styles: Styles$1,
	Scripts: Scripts$1,
	Components: Components$1,
	Assets: Assets$1
};

var Templates = {
	dir: "src/templates",
	path: "/mini-md/templates"
};
var Styles = {
	dir: "src/styles",
	path: "/mini-md/styles"
};
var Scripts = {
	dir: "src/scripts",
	path: "/mini-md/scripts"
};
var Components = {
	dir: "src/components",
	path: "/mini-md/components"
};
var Assets = {
	dir: "src/assets",
	path: "/mini-md/assets"
};
var projectConfig = {
	Templates: Templates,
	Styles: Styles,
	Scripts: Scripts,
	Components: Components,
	Assets: Assets
};

class Helpers {
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

  /**
   * "Splices" a string in the same way that Array.prototype.splice() does
   * @param {string} str The string to splice
   * @param {number} index The index to start splicing at
   * @param {number} count The number of characters to remove
   * @param {string} [add] The string to add
   * @returns {string} The spliced string
   */
  static spliceSlice(str, index, count, add) {
    // We cannot pass negative indexes directly to the 2nd slicing operation.
    if (index < 0) {
      index = str.length + index;
      if (index < 0) {
        index = 0;
      }
    }

    return str.slice(0, index) + (add || "") + str.slice(index + count);
  }
}

/**
 * Handles all IO operations
 */
class IO {
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

/**
 * Express engine for serving MiniMD templates
 */
class MiniMD {
  /**
   * @type {Template[]}
   */
  _templates;
  /**
   * @typedef {("all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" | "use")} Method
   * @typedef {[string, string] | [string, string, Method]} Route
   */
  /**
   * @type {Route[]}
   */
  _routes;
  /**
   * @type {MarkdownIt}
   */
  _md;
  /**
   * @type {IO}
   */
  io;
  /**
   * @type {express.Application}
   */
  app;
  /**
   * @typedef {Object} Handler
   * @property {string} path
   * @property {express.RequestHandler} handler
   * @property {Method} method
   */
  /**
   * @type {Handler[]}
   */
  _handlers = [];
  /**
   * @typedef {(app: express.Application) => void} Modifier
   */
  /**
   * @type {Modifier[]}
   */
  _modifiers = [];
  /**
   * The markdown parser
   * @param {express.Application} app The express app
   */
  /**
   * Adds the given routes to the app.
   * @param {Route[]} routes These are in the format [ route, templateName, method = "get" ]
   * @returns {void}
   */
  addRoutes(routes) {
    this._routes = routes.map(([route, name, method]) => {
      if (!route.startsWith("/")) {
        route = "/" + route;
      }
      if (!route.endsWith("/")) {
        route = route + "/";
      }
      return [route, name, method];
    });
  }

  /**
   * Adds a middleware handler to the express app
   * @private
   * @param {Method} method The method to add
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler The handler to add
   * @returns {void}
   */
  addHandler(method, path, handler) {
    if (!handler) {
      handler = /** @type {express.RequestHandler} */ (path);
      path = "*";
    }
    if (
      ![
        "all",
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "options",
        "head",
        "use",
      ].includes(method)
    ) {
      throw new Error("Invalid method: " + method);
    }
    const miniHandler = {
      /** @type {string} */ path,
      /** @type {express.RequestHandler} */ handler,
      /** @type {Method} */ method,
    };
    this._handlers.push(miniHandler);
  }

  /**
   * @overload
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * @overload
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * Adds a use handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler
   * @returns {void}
   */
  use(path, handler) {
    this.addHandler("use", path, handler);
  }

  /**
   * @overload
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * @overload
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * Adds a get handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler
   * @returns {void}
   */
  get(path, handler) {
    this.addHandler("get", path, handler);
  }

  /**
   * @overload
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * @overload
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * Adds a post handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler
   * @returns {void}
   */
  post(path, handler) {
    this.addHandler("post", path, handler);
  }

  /**
   * @overload
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * @overload
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * Adds a put handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler
   * @returns {void}
   */
  put(path, handler) {
    this.addHandler("put", path, handler);
  }

  /**
   * @overload
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * @overload
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * Adds a delete handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler
   * @returns {void}
   */
  delete(path, handler) {
    this.addHandler("delete", path, handler);
  }

  /**
   * @overload
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * @overload
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * Adds a patch  handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler
   * @returns {void}
   */
  patch(path, handler) {
    this.addHandler("patch", path, handler);
  }

  /**
   * @overload
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * @overload
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * Adds an options handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler
   * @returns {void}
   */
  options(path, handler) {
    this.addHandler("options", path, handler);
  }

  /**
   * @overload
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * @overload
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * Adds a head handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler
   * @returns {void}
   */
  head(path, handler) {
    this.addHandler("head", path, handler);
  }

  /**
   * @overload
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * @overload
   * @param {express.RequestHandler} handler The handler to add
   * @returns {void}
   */
  /**
   * Adds an all handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler
   * @returns {void}
   */
  all(path, handler) {
    this.addHandler("all", path, handler);
  }

  /**
   * Allows modification of the express app when it is initialized
   * @param {Modifier} callback The callback to run when the express app is initialized
   */
  modify(callback) {
    this._modifiers.push(callback);
  }

  /**
   * Serves the express app
   * @param {number} port The port to serve on
   * @param {(() => void)=} onListen The callback to run when the server starts listening
   * @returns {void}
   */
  listen(port, onListen) {
    this.init();
    this.app.listen(port, onListen);
  }

  /**
   * Read the templates from the directory specified in the config. The templates must be markdown files.
   * @returns {Template[]}
   */
  readTemplates() {
    /**
     * @type {Template[]}
     */
    const templates = [];
    [/** @type {const} */ ("user"), /** @type {const} */ ("project")].forEach(
      (type) => {
        const templateFiles = this.io.getFiles("Templates", type);
        templateFiles.forEach((file) => {
          const name = file.replace(".md", "");
          const template = new Template(
            name,
            this.io.getFileContent(file, "Templates", type)
          );
          templates.push(template);
        });
      }
    );
    Helpers.success(
      "Found templates",
      templates.map((template) => template.name).join(", ")
    );
    return templates;
  }

  /**
   * Initialize the IO class
   * @private
   * @returns {void}
   */
  initIO() {
    this.io = new IO();
  }

  /**
   * Initialize the templates
   * @private
   * @returns {void}
   */
  initTemplates() {
    this._templates = this.readTemplates();
  }

  /**
   * Initialize the markdown parser
   * @private
   * @returns {void}
   */
  initMd() {
    this._md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    this._md.use(markdownItCheckbox);
    this._md.use(markdownItAttrs);
    this._md.use(markdownitAnchor);
  }

  /**
   * Do all the parsing and rendering for the given template
   * @param {string} name The name of the template
   * @param {string} route The route that the template is being rendered for
   * @returns {[[string, string], Attrs]} The head and body of the rendered template and the parsed attributes
   */
  handleTemplate(name, route) {
    const template = this.getTemplate(name);
    if (!template) {
      Helpers.error("Could not find template:", name, "for route:", route);
      return null;
    }
    const { dependencies, ...attrs } = this.parseAttrs(template.content);
    const [body, head] = this.renderTemplate(template, dependencies, attrs);
    return [[head, body], attrs];
  }

  /**
   * Initialize the express app
   * @private
   * @returns {void}
   */
  initApp() {
    this.app = express();
    this.static();
    this._modifiers.forEach((modifier) => {
      modifier(this.app);
    });
    this._handlers.forEach((handler) => {
      this.app[handler.method](handler.path, handler.handler);
    });
    if (!this._routes) {
      Helpers.warn("No routes added. See MiniMD.addRoutes(), skipping...");
      return;
    }
    this._routes.forEach(([route, name, method]) => {
      this.app[method ?? "get"](route, (req, res, next) => {
        const parsed = this.handleTemplate(name, route);
        if (!parsed) {
          next();
        } else {
          const [[head, body], attrs] = parsed;
          const uniqueHead = [...new Set(head.split("\n"))].join("\n");
          res.send(this.makeDocument(uniqueHead + body, attrs));
        }
      });
      Helpers.success(
        "added",
        method ?? "get",
        "route",
        route,
        "for template",
        name
      );
    });
  }

  /**
   * Initialize mini-md. This is called automatically when you call MiniMD.listen()
   */
  init() {
    this.initIO();
    this.initTemplates();
    this.initMd();
    this.initApp();
  }

  /**
   * Register the static assets with the express app
   * @returns {void}
   */
  static() {
    [/** @type {const} */ ("user"), /** @type {const} */ ("project")].forEach(
      (type) => {
        /**
         * @type {(keyof IO['_projectConfig'])[]}
         */
        const dirs = /** @type {(keyof IO['_projectConfig'])[]} */ ([
          /** @type {const} */ ("Templates"),
          /** @type {const} */ ("Styles"),
          /** @type {const} */ ("Components"),
          /** @type {const} */ ("Assets"),
          /** @type {const} */ ("Scripts"),
        ]);
        dirs.forEach((dir) => {
          const configPath = this.io.getPath(dir, type);
          const configDir = this.io.getDirPath(dir, type);
          this.use(configPath, express.static(configDir));
        });
      }
    );
  }

  /**
   * Get the template with the given name
   * @param {string} name The name of the template
   * @returns {Template}
   */
  getTemplate(name) {
    return this._templates.find((template) => template.name === name);
  }

  /**
   * Render the given template
   * @param {Template} template The template to render
   * @param {Dependency[]} dependencies The dependencies to inject
   * @param {Attrs} attrs The attributes to add to the head
   * @returns {[string, string]} The rendered template and the head
   */
  renderTemplate(template, dependencies, attrs) {
    const content = template.content;
    const [withDependencies, depHeads] = this.addDependencies(
      content,
      dependencies
    );
    const rendered = this._md.render(withDependencies);
    const wrapped = this.wrap(rendered);
    const components = this.makeComponentTags();
    const styles = this.makeStyleTags();
    const scripts = this.makeScriptTags(template);
    const head = this.buildHead(components, styles, scripts, attrs, depHeads);
    const uniqueHead = [...new Set(head.split("\n"))].join("\n");
    return [wrapped, uniqueHead];
  }

  /**
   * Injects values into dependency templates
   * @param {Dependency[]} dependencies The dependencies to inject
   * @returns {Dependency[]} The dependencies with the values injected
   */
  injectIntoDependencies(dependencies) {
    dependencies.sort((a, b) => a.index - b.index);
    let offSet = 0;
    dependencies.forEach((dependency) => {
      console.log("injecting into dependency:", dependency.name);
      let depTemplate = this.getTemplate(dependency.name)?.content;
      console.log("dependency template:", depTemplate);
      if (!depTemplate) {
        Helpers.warn("Could not find dependency template: " + dependency.name);
        return;
      }
      const injections = dependency.injections;
      const injectionMarkers = depTemplate.matchAll(
        new RegExp(`{{\\s*(.*?)\\s*}}`, "g")
      );
      [...injectionMarkers].forEach((match) => {
        const start = match.index + offSet;
        const injectionKey = match[1];
        console.log(
          "searching for injection:",
          injectionKey,
          "in",
          dependency.name,
          "with injections:",
          injections
        );
        let value = injections.find(
          (injection) => injection.name === injectionKey
        )?.value;
        if (!value) {
          Helpers.warn(
            "Could not find injection:",
            injectionKey,
            "for dependency:",
            dependency.name
          );
          value = "";
        }
        depTemplate = Helpers.spliceSlice(
          depTemplate,
          start,
          match[0].length,
          value
        );
        offSet += value.length - match[0].length;
        dependency.content = depTemplate;
      });
    });
    return dependencies;
  }

  /**
   * Creates head tags for the given dependencies
   * @param {Dependency[]} dependencies The dependencies to create tags for
   * @returns {string[]} The tags
   */
  makeDependencyTags(dependencies) {
    const tags = [];
    dependencies.forEach((dependency) => {
      const template = this.getTemplate(dependency.name);
      if (!template) {
        Helpers.warn("Could not find dependency template:", dependency.name);
        return;
      }
      const attrs = this.parseAttrs(template.content);
      const scripts = this.makeScriptTags(template);
      const head = this.buildHead("", "", scripts, attrs, []);
      tags.push(head);
    });
    return tags;
  }

  /**
   * Replaces dependencies with the content of the dependency
   * @param {string} rendered The rendered template
   * @param {Dependency[]} dependencies The dependencies to inject
   * @returns {string} The rendered template with the dependencies injected
   */
  injectDependencies(rendered, dependencies) {
    dependencies.sort((a, b) => a.index - b.index);
    let offSet = 0;
    dependencies.forEach((dependency) => {
      const depTemplate =
        dependency.content ?? this.getTemplate(dependency.name)?.content;
      if (!depTemplate) {
        Helpers.warn("Could not find dependency template: " + dependency.name);
        return;
      }
      rendered = Helpers.spliceSlice(
        rendered,
        dependency.index + offSet,
        dependency.length,
        depTemplate
      );
      offSet += depTemplate.length - dependency.length;
    });
    return rendered;
  }

  /**
   * Injects the dependencies into the rendered template
   * @param {string} rendered The rendered template
   * @param {Dependency[]} dependencies The dependencies to inject
   * @returns {[string, string[]]} The rendered template and the tags to add to the head
   */
  addDependencies(rendered, dependencies) {
    console.log("adding dependencies");
    const tags = [];
    dependencies = this.injectIntoDependencies(dependencies);
    const dependencyTags = this.makeDependencyTags(dependencies);
    rendered = this.injectDependencies(rendered, dependencies);
    tags.push(...dependencyTags);
    return [rendered, tags];
  }

  /**
   * Builds the head of the rendered template
   * @param {string} components The components to add
   * @param {string} styles The styles to add
   * @param {string} scripts The scripts to add
   * @param {Attrs} attrs The attributes to add
   * @param {string[]} depHeads The dependency heads to add
   * @returns {string}
   */
  buildHead(components, styles, scripts, attrs, depHeads) {
    return `
    <head>
    ${scripts}
    ${components}
    ${styles}
    ${
      attrs.schemes
        ? attrs.schemes
            .map(
              (scheme) =>
                `<link rel="stylesheet" href="${this.io.getPath(
                  "Styles",
                  "user"
                )}/schemes/${scheme}.css">`
            )
            .join("\n")
        : ""
    }
    ${attrs.title ? `<title>${attrs.title}</title>` : ""}
    ${attrs.charset ? `<meta charset="${attrs.charset}">` : ""}
    ${
      attrs.viewport ? `<meta name="viewport" content="${attrs.viewport}">` : ""
    }
    ${
      attrs.description
        ? `<meta name="description" content="${attrs.description}">`
        : ""
    }
    ${attrs.author ? `<meta name="author" content="${attrs.author}">` : ""}
    ${
      attrs.keywords ? `<meta name="keywords" content="${attrs.keywords}">` : ""
    }
    ${attrs.robots ? `<meta name="robots" content="${attrs.robots}">` : ""}
    ${
      attrs.ogTitle
        ? `<meta property="og:title" content="${attrs.ogTitle}">`
        : ""
    }
    ${attrs.ogType ? `<meta property="og:type" content="${attrs.ogType}">` : ""}
    ${attrs.ogUrl ? `<meta property="og:url" content="${attrs.ogUrl}">` : ""}
    ${
      attrs.ogDescription
        ? `<meta property="og:description" content="${attrs.ogDescription}">`
        : ""
    }
    ${
      attrs.ogImage
        ? `<meta property="og:image" content="${attrs.ogImage}">`
        : ""
    }
    ${
      attrs.twitterCard
        ? `<meta name="twitter:card" content="${attrs.twitterCard}">`
        : ""
    }
    ${
      attrs.ogLocale
        ? `<meta property="og:locale" content="${attrs.ogLocale}">`
        : ""
    }
    ${
      attrs.ogSiteName
        ? `<meta property="og:site_name" content="${attrs.ogSiteName}">`
        : ""
    }
    ${
      attrs.twitterImageAlt
        ? `<meta name="twitter:image:alt" content="${attrs.twitterImageAlt}">`
        : ""
    }
    ${depHeads.join("\n")}
    </head>
    `
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  }
  /**
   * Wraps content in <mini-md> tags
   * @param {string} content The content to wrap
   * @returns {string} The wrapped content
   */
  wrap(content) {
    return `
    <body>
      <mini-md>${content}</mini-md>
    </body>
      `;
  }

  /**
   * Wraps the rendered template in a document
   * @param {string} rendered The rendered template
   * @param {Attrs} attrs The parsed attributes
   */
  makeDocument(rendered, attrs) {
    return `<!DOCTYPE html>
    <html lang="${attrs.lang ?? "en"}">
      ${rendered}
    </html>`;
  }

  /**
   * Builds the component script tags
   * @returns {string}
   */
  makeComponentTags() {
    const userComponentPath = this.io.getPath("Components", "user");
    const userComponents = this.io
      .getFiles("Components", "user")
      .map((file) => {
        return `<script src="${userComponentPath}/${file}"></script>`;
      });
    const projectComponentPath = this.io.getPath("Components", "project");
    const projectComponents = this.io
      .getFiles("Components", "project")
      .map((file) => {
        return `<script src="${projectComponentPath}/${file}"></script>`;
      });
    const components = [...userComponents, ...projectComponents];
    return components.join("\n");
  }

  /**
   * Builds the style tags
   */
  makeStyleTags() {
    const userStylePath = this.io.getPath("Styles", "user");
    const userStyles = this.io.getFiles("Styles", "user").map((file) => {
      const parts = file.split(/[/\\]/g);
      if (!parts.includes("schemes"))
        return `<link rel="stylesheet" href="${userStylePath}/${file}">`;
    });
    const projectStylePath = this.io.getPath("Styles", "project");
    const projectStyles = this.io.getFiles("Styles", "project").map((file) => {
      return `<link rel="stylesheet" href="${projectStylePath}/${file}">`;
    });
    const styles = [...userStyles, ...projectStyles];
    return styles.join("\n");
  }

  /**
   * Builds the script tags
   * @param {Template} template The template to build the script tags for
   * @returns {string}
   */
  makeScriptTags(template) {
    const scripts = [];
    // add global project scripts
    const scriptPath = this.io.getPath("Scripts", "project");
    const scriptFiles = this.io.getFiles("Scripts", "project");
    scriptFiles.forEach((file) => {
      scripts.push(`<script src="${scriptPath}/${file}"></script>`);
    });
    // add scripts that match the template name
    const userScriptPath = this.io.getPath("Scripts", "user");
    const userScriptFiles = this.io.getFiles("Scripts", "user");
    userScriptFiles.forEach((file) => {
      const parts = file.split(/[/\\]/g);
      if (
        parts.some((part) => part.startsWith(template.name)) ||
        parts.slice(0, parts.length - 1).includes("global")
      ) {
        scripts.push(`<script src="${userScriptPath}/${file}"></script>`);
      }
    });
    return scripts.join("\n");
  }

  /**
   * Represents an injection to inject into a template. {{ name }} will be replaced with the value
   * @typedef {Object} Injection
   * @property {string} name The name of the injection
   * @property {string} value The value of the injection
   */
  /**
   * Represents a dependency on another template
   * @typedef {Object} Dependency
   * @property {Injection[]} injections The injections to inject into the template.
   * @property {string} name The name of the dependency
   * @property {number} index The index of the dependency
   * @property {number} length The length of the dependency
   * @property {string=} content The content of the dependency
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
  parseAttrs(template) {
    const attrs = {
      dependencies: [],
      schemes: [],
    };
    const regex = /(\[\/\/\]: # \(.*\))/g;
    const matches = [...template.matchAll(regex)];

    if (matches.length === 0) {
      return attrs;
    }

    matches.forEach((macro) => {
      const attrRegex =
        /(?:([a-zA-Z0-9]*?)="([^\"]+?)")(?:\s+([a-zA-Z0-9]+?)="([^\"]+?)")*?/g;
      const entries = [...macro[0].matchAll(attrRegex)];
      const mappedEntries = entries.map((entry) => ({
        name: entry[1],
        value: entry[2],
      }));
      if (entries.length === 0) {
        Helpers.warn("Could not parse attributes from macro:", macro[0]);
      } else if (mappedEntries[0].name === "template") {
        const endOfLine = template.indexOf("\n", macro.index);
        const dependency = {
          name: mappedEntries[0].value,
          injections: mappedEntries.slice(1),
          index: macro.index,
          length: endOfLine - macro.index,
        };
        console.log("found dependency:", dependency);
        attrs.dependencies.push(dependency);
      } else if (mappedEntries[0].name === "scheme") {
        attrs.schemes.push(mappedEntries[0].value);
      } else {
        mappedEntries.forEach((entry) => {
          attrs[entry.name] = entry.value;
        });
      }
    });
    return attrs;
  }
}

var index = {
  MiniMD,
  Template,
};

exports.MiniMD = MiniMD;
exports.Template = Template;
exports.default = index;

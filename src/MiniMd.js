"use strict";
import MarkdownIt from "markdown-it";
import markdownItCheckbox from "markdown-it-checkbox";
import markdownItAttrs from "markdown-it-attrs";
import markdownitAnchor from "markdown-it-anchor";
import Template from "./Template.js";
import express from "express";
import IO from "./IO.js";
import Helpers from "./helpers.js";

/**
 * Express engine for serving MiniMD templates
 */
export default class MiniMD {
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
   * Injects the dependencies into the rendered template
   * @param {string} rendered The rendered template
   * @param {Dependency[]} dependencies The dependencies to inject
   * @returns {[string, string[]]} The rendered template and the tags to add to the head
   */
  addDependencies(rendered, dependencies) {
    const offsetAdditions = [];
    const tags = [];
    dependencies.sort((a, b) => a.index - b.index);
    dependencies.forEach((dependency) => {
      const iOffset = offsetAdditions
        .filter((a) => a.start < dependency.index)
        .reduce((acc, cur) => acc + cur.length, 0);
      const start = rendered.slice(0, dependency.index + iOffset);
      const end = rendered.slice(
        dependency.index + iOffset + dependency.length
      );
      const name = dependency.name;
      const template = this.getTemplate(name);
      if (!template) {
        Helpers.warn("Could not find dependency template: " + name);
        return;
      }
      const rec = this.parseAttrs(this.getTemplate(dependency.name).content);
      const { dependencies: recDependencies, ...recAttrs } = rec;
      const [body, recTags] = this.addDependencies(
        template.content,
        recDependencies
      );
      const attrs = this.parseAttrs(template.content);
      attrs.schemes = [...new Set([...attrs.schemes, ...recAttrs.schemes])];
      const recScripts = this.makeScriptTags(this.getTemplate(dependency.name));
      const head = this.buildHead("", "", recScripts, attrs, recTags);

      const injected = start + body + end;
      offsetAdditions.push({
        start: dependency.index + iOffset,
        length: body.length,
      });
      rendered = injected;
      tags.push(head);
    });
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
    console.log(userScriptFiles);
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
  parseAttrs(template) {
    const attrs = {
      dependencies: [],
      schemes: [],
    };
    const regex = /(\[\/\/\]: # \(.*\))/g;
    let matches = [];
    let match;
    while ((match = regex.exec(template)) !== null) {
      matches.push(match);
    }
    if (matches.length === 0) {
      return attrs;
    }

    matches.forEach((macro, index) => {
      const attrRegex = /([a-zA-Z0-9]*)="(.*)"[ ,)]*/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(macro[0])) !== null) {
        const key = attrMatch[1];
        const value = attrMatch[2];
        if (key === "template") {
          const endOfLine = template.indexOf("\n", macro.index);
          const dependency = {
            name: value,
            index: macro.index,
            length: endOfLine - macro.index,
          };
          attrs.dependencies.push(dependency);
        } else if (key === "scheme") {
          attrs.schemes.push(value);
        } else {
          attrs[key] = value;
        }
      }
    });
    return attrs;
  }
}

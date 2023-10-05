import MarkdownIt from "markdown-it";
import markdownItCheckbox from "markdown-it-checkbox";
import markdownItAttrs from "markdown-it-attrs";
import markdownitAnchor from "markdown-it-anchor";
import Template from "./Template.js";
import express from "express";
import IO from "./IO.js";

/**
 * Express engine for serving MiniMD templates
 */
export default class MiniMD {
  _templates;
  _other__dirname;
  /**
   * @typedef {([string, string])[]} routes
   */
  /**
   * @type {routes}
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
   * @property {string} method
   */
  /**
   * @type {Handler[]}
   */
  _handlers = [];
  /**
   * The markdown parser
   * @param {express.Application} app The express app
   */

  /**
   * Adds the given routes
   * @param {routes} routes The routes to add
   * @returns {void}
   */
  addRoutes(routes) {
    this._routes = routes.map(([route, name]) => {
      if (!route.startsWith("/")) {
        route = "/" + route;
      }
      if (!route.endsWith("/")) {
        route = route + "/";
      }
      return [route, name];
    });
  }

  /**
   * @typedef {("all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" | "use")} Method
   */
  /**
   * Adds a path to the express app
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
   * Adds a use path to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler The handler to add
   */
  use(path, handler) {
    this.addHandler("use", path, handler);
  }

  /**
   * Adds a get route to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler The handler to add
   */
  get(path, handler) {
    this.addHandler("get", path, handler);
  }

  /**
   * Adds a post route to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler The handler to add
   */
  post(path, handler) {
    this.addHandler("post", path, handler);
  }

  /**
   * Adds a put route to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler The handler to add
   */
  put(path, handler) {
    this.addHandler("put", path, handler);
  }

  /**
   * Adds a delete route to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler The handler to add
   */
  delete(path, handler) {
    this.addHandler("delete", path, handler);
  }

  /**
   * Adds a patch route to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler The handler to add
   */
  patch(path, handler) {
    this.addHandler("patch", path, handler);
  }

  /**
   * Adds a options handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler The handler to add
   */
  options(path, handler) {
    this.addHandler("options", path, handler);
  }

  /**
   * Adds a head handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler The handler to add
   */
  head(path, handler) {
    this.addHandler("head", path, handler);
  }

  /**
   * Adds a all handler to the express app
   * @param {string | express.RequestHandler} path The path to add
   * @param {express.RequestHandler=} handler The handler to add
   */
  all(path, handler) {
    this.addHandler("all", path, handler);
  }

  /**
   * Serves the express app
   * @param {number} port The port to serve on
   * @param {(() => void)=} onListen The callback to run when the server starts listening
   * @returns {void}
   */
  listen(port, onListen) {
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
    console.log(
      "Found templates",
      templates.map((template) => template.name).join(", ")
    );
    return templates;
  }

  initIO() {
    this.io = new IO();
  }

  initTemplates() {
    this._templates = this.readTemplates();
  }

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

  initApp() {
    this.app = express();
    this.static();
    this._handlers.forEach((handler) => {
      this.app[handler.method](handler.path, handler.handler);
    });
    this._routes.forEach(([route, name]) => {
      console.log("adding route", route, name);
      this.app.get(route, (req, res, next) => {
        const template = this.getTemplate(name);
        if (!template) {
          console.warn("Could not find template:", name, "for route:", route);
          return next();
        }
        const parsedAttrs = this.parseAttrs(template.content);
        const { dependencies, ...attrs } = parsedAttrs;
        const [body, head] = this.renderTemplate(template, dependencies, attrs);
        res.send(this.makeDocument(head + body, attrs));
      });
    });
  }

  /**
   * Initialize the app
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
    const withDependencies = this.addDependencies(content, dependencies);
    const rendered = this._md.render(withDependencies);
    const wrapped = this.wrap(rendered);
    const components = this.makeComponentTags();
    const styles = this.makeStyleTags(attrs);
    const head = this.buildHead(components, styles, attrs);
    return [wrapped, head];
  }

  /**
   * Injects the dependencies into the rendered template
   * @param {string} rendered The rendered template
   * @param {Dependency[]} dependencies The dependencies to inject
   */
  addDependencies(rendered, dependencies) {
    let iOffset = 0;
    dependencies.sort((a, b) => a.index - b.index);
    dependencies.forEach((dependency) => {
      const start = rendered.slice(0, dependency.index + iOffset);
      const length = dependency.length;
      const end = rendered.slice(dependency.index + iOffset + length);
      const template = this.getTemplate(dependency.name);
      if (!template) {
        console.warn("Could not find template: " + dependency.name);
        return;
      }
      const injected = start + template.content + end;
      iOffset += template.content.length;
      rendered = injected;
    });
    return rendered;
  }

  /**
   * Builds the head of the rendered template
   * @param {string} components The components to add
   * @param {string} styles The styles to add
   * @param {Attrs} attrs The attributes to add
   * @returns {string}
   */
  buildHead(components, styles, attrs) {
    return `
    <head>
    ${components}
    ${styles}
    ${
      attrs.scheme
        ? `<link rel="stylesheet" href="${this.io.getPath(
            "Styles",
            "user"
          )}/schemes/${attrs.scheme}.css">`
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
    </head>
    `;
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
   * @param {Attrs} attrs The parsed attributes
   */
  makeStyleTags(attrs) {
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
  parseAttrs(template) {
    const attrs = {
      dependencies: [],
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
        }
        attrs[attrMatch[1]] = attrMatch[2];
      }
    });
    return attrs;
  }
}

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
   * @param {Express} app The express app
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
   * Adds a path to the express app
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   */
  use(path, handler) {
    if (!handler) {
      handler = path;
      path = "*";
    }
    const miniHandler = {
      path,
      handler,
      method: "use",
    };
    this._handlers.push(miniHandler);
  }

  /**
   * Adds a get route to the express app
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   */
  get(path, handler) {
    const miniHandler = {
      path,
      handler,
      method: "get",
    };
    this._handlers.push(miniHandler);
  }

  /**
   * Adds a post route to the express app
   * @param {string} path The path to add
   * @param {express.RequestHandler} handler The handler to add
   */
  post(path, handler) {
    const miniHandler = {
      path,
      handler,
      method: "post",
    };
    this._handlers.push(miniHandler);
  }

  /**
   * Serves the express app
   * @param {number} port The port to serve on
   * @param {() => void} onListen The callback to run when the server starts listening
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
    const userTemplates = this.io.getFiles("Templates", "user").map((file) => {
      const name = file.replace(".md", "");
      return new Template(
        name,
        this.io.getFileContent(file, "Templates", "user")
      );
    });
    const projectTemplates = this.io
      .getFiles("Templates", "project")
      .map((file) => {
        const name = file.replace(".md", "");
        return new Template(
          name,
          this.io.getFileContent(file, "Templates", "project")
        );
      });
    templates.push(...userTemplates);
    templates.push(...projectTemplates);
    console.log("templates", templates);
    return templates;
  }

  initIO() {
    this.io = new IO(this._other__dirname);
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
          console.warn("Could not find template: " + name);
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
   * Initialize the app for standalone use
   */
  init() {
    this.initIO();
    this.initTemplates();
    this.initMd();
    this.initApp();
  }

  /**
   * Initialize the app for use as an express engine
   */
  initEngine() {
    this.initIO();
    this.initMd();
  }

  /**
   * Register the static assets with the express app
   * @param {string} other__dirname The directory name of the app
   * @param {Express} app The express app
   * @returns {void}
   */
  static() {
    ["user", "project"].forEach((type) => {
      ["Styles", "Components", "Templates", "Assets"].forEach((dir) => {
        const configPath = this.io.getPath(dir, type);
        const configDir = this.io.getDirPath(dir, type);
        this.use(configPath, express.static(configDir));
      });
    });
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
    console.log("rendered", wrapped);
    return [wrapped, head];
  }

  /**
   * Returns an engine version of mini-md
   */
  engine() {
    this.initEngine();
    function __express(filePath, options, callback) {
      const templateFile = this.io.readFile(filePath);
      const template = new Template(filePath, templateFile);
      if (!this._templates) this._templates = [];
      if (!this._templates.includes(template)) this._templates.push(template);
      const parsedAttrs = this.parseAttrs(template.content);
      const { dependencies, ...attrs } = parsedAttrs;
      const [body, head] = this.renderTemplate(template, dependencies, attrs);
      const document = this.makeDocument(head + body, attrs);
      return callback(null, document);
    }
    return __express.bind(this);
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
   * @param {string[]} styles The styles to add
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
   */
  makeDocument(rendered, attrs) {
    return `<!DOCTYPE html>
    <html lang="${attrs.lang ?? "en"}">
      ${rendered}
    </html>`;
  }

  /**
   * Builds the component script tags
   * @param {string} rendered The rendered template
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
    console.log("Parsing attrs for template", template);
    const attrs = {
      dependencies: [],
    };
    const regex = /(\[\/\/\]: # \(.*\))/g;
    let matches = [];
    let match;
    while ((match = regex.exec(template)) !== null) {
      console.log("match", match);
      matches.push(match);
    }
    if (matches.length === 0) {
      console.log("No matches");
      return attrs;
    }

    matches.forEach((macro, index) => {
      const attrRegex = /([a-zA-Z0-9]*)="(.*)"[ ,)]*/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(macro[0])) !== null) {
        const key = attrMatch[1];
        const value = attrMatch[2];
        if (key === "template") {
          console.log("found dependency", value);
          const endOfLine = template.indexOf("\n", macro.index);
          const dependency = {
            name: value,
            index: macro.index,
            length: endOfLine - macro.index,
          };
          attrs.dependencies.push(dependency);
        }
        console.log("attr key", attrMatch[1], "value", attrMatch[2]);
        attrs[attrMatch[1]] = attrMatch[2];
      }
    });
    return attrs;
  }
}

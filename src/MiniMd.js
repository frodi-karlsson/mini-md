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
  constructor() {}

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

  /**
   * Initialize the app
   */
  init() {
    this.io = new IO();
    this._templates = this.readTemplates();
    this._md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    this._md.use(markdownItCheckbox);
    this._md.use(markdownItAttrs);
    this._md.use(markdownitAnchor);
    this.app = express();
    this.static();
    this.use((req, res, next) => {
      const baseUrl = req.baseUrl;
      const path = req.path;
      const fullPath = baseUrl + path;
      console.log("req", fullPath);
      next();
    });
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
        const rendered = this.renderTemplate(template);
        res.send(rendered);
      });
    });
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
   * @param {Express.Response} res The response
   * @returns {string}
   */
  renderTemplate(template) {
    const content = template.content;
    const parsedAttrs = this.parseAttrs(content);
    const { dependencies, ...attrs } = parsedAttrs;
    const withDependencies = this.addDependencies(content, dependencies);
    const rendered = this._md.render(withDependencies);
    const componentTag = this.makeComponentTags(rendered);
    const wrapped = this.wrap(componentTag, attrs);
    return wrapped;
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
   * Wraps content in <mini-md> tags
   * @param {string} content The content to wrap
   * @param {Attrs} attrs The attributes to add to the mini-md tag
   */
  wrap(content, attrs) {
    return `<mini-md ${Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ")}>${content}</mini-md>`;
  }

  /**
   * Add the custom tag script to the rendered template
   * @param {string} rendered The rendered template
   * @returns {string}
   */
  makeComponentTags(rendered) {
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
    const withHead = `<head>\n${components.join("\n")}\n</head>\n${rendered}`;
    return withHead;
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
      const attrRegex = /([a-zA-Z0-9]*)="(.*)"[ ,\)]*/g;
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
        console.log("attr key", attrMatch[1], "value", attrMatch[2]);
        attrs[attrMatch[1]] = attrMatch[2];
      }
    });
    return attrs;
  }
}

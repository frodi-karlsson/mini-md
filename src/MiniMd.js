import MarkdownIt from "markdown-it";
import markdownItCheckbox from "markdown-it-checkbox";
import markdownItAttrs from "markdown-it-attrs";
import markdownitAnchor from "markdown-it-anchor";
import config from "config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Template from "./Template.js";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Express engine for serving MiniMD templates
 */
export default class MiniMD {
  _customTags;
  _templates;
  _other__dirname;
  /**
   * The markdown parser
   * @param {string} other__dirname The directory name of the app
   * @param {Express} app The express app
   */
  constructor(other__dirname, app) {
    this._other__dirname = other__dirname;
    this.static(app);
    this._customTags = this.readCustomTags(other__dirname);
    this._templates = this.readTemplates(other__dirname);
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
   * Read custom tag scripts from the directory specified in the config. The custom tags must be javascript files.
   * @returns {string[]}
   */
  readCustomTags() {
    const tags = [];
    const customTagDir = config.get("Components.dir");
    const exists = fs.existsSync(path.join(this._other__dirname, customTagDir));
    if (!exists) {
      console.warn("Custom tag directory does not exist: " + customTagDir);
    } else {
      const files = fs.readdirSync(
        path.join(this._other__dirname, customTagDir)
      );
      files.forEach((file) => {
        if (file.split(".").pop() !== "js") {
          console.warn("Ignoring non-javascript file: " + file);
          return;
        }
        tags.push(path.join(customTagDir, file));
      });
    }
    const libraryTagDir = path.join(__dirname, "./components");
    const libraryExists = fs.existsSync(libraryTagDir);
    if (!libraryExists) {
      console.warn("Library tag directory does not exist: " + libraryTagDir);
    } else {
      const libraryFiles = fs.readdirSync(libraryTagDir);
      libraryFiles.forEach((file) => {
        if (file.split(".").pop() !== "js") {
          console.warn("Ignoring non-javascript file: " + file);
          return;
        }
        tags.push("/mini-md/components/" + file);
      });
    }
    return tags;
  }

  /**
   * Read the templates from the directory specified in the config. The templates must be markdown files.
   * @returns {Template[]}
   */
  readTemplates(other__dirname) {
    /**
     * @type {Template[]}
     */
    const templates = [];
    const templateDir = config.get("Templates.dir");
    const replaced = templateDir.replace(/^\//, "");
    const exists = fs.existsSync(path.join(other__dirname, replaced));
    if (!exists) {
      console.warn("Template directory does not exist: " + templateDir);
      return templates;
    }
    const files = fs.readdirSync(path.join(other__dirname, replaced));
    files.forEach((file) => {
      if (file.split(".").pop() !== "md") {
        console.warn("Ignoring non-markdown file: " + file);
        return;
      }
      const tempPath = path.join(other__dirname, replaced, file);
      const name = file.replace(".md", "");
      const template = new Template(name, tempPath);
      templates.push(template);
    });
    console.log(
      "templates",
      templates.map((template) => template.name).join(", ")
    );
    return templates;
  }

  /**
   * Register the static assets with the express app
   * @param {string} other__dirname The directory name of the app
   * @param {Express} app The express app
   * @returns {void}
   */
  static(app) {
    const other__dirname = this._other__dirname;
    const styles = config.get("Styles.dir");
    app.use(styles, express.static(path.join(other__dirname, styles)));
    const components = config.get("Components.dir");
    app.use(components, express.static(path.join(other__dirname, components)));
    const templateDir = config.get("Templates.dir");
    app.use(
      templateDir,
      express.static(path.join(other__dirname, templateDir))
    );
    const scripts = config.get("Scripts.dir");
    app.use(scripts, express.static(path.join(other__dirname, scripts)));
    app.use(
      "/mini-md/scripts",
      express.static(path.join(__dirname, "scripts"))
    );
    app.use("/mini-md/styles", express.static(path.join(__dirname, "styles")));
    app.use(
      "/mini-md/components",
      express.static(path.join(__dirname, "components"))
    );
    app.use("/assets", express.static(other__dirname + "/assets"));
  }

  /**
   * Get the MD engine for express
   * @returns {Express.Engine}
   */
  getRequestHandler() {
    const onReq = (req, res, next) => {
      const path = req.path;
      const base = req.baseUrl;
      let fullPath = base + path;
      const template = this.getTemplate(fullPath.replace(/^\//, ""));
      if (!template) {
        return next();
      }
      const rendered = this.renderTemplate(template);
      res.send(rendered);
    };
    return onReq.bind(this);
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
    console.log("parsing", template.name);
    console.log("dependencies", dependencies);
    const withDependencies = this.addDependencies(content, dependencies);
    const rendered = this._md.render(withDependencies);
    const addedCustom = this.addCustomTagScript(rendered);
    const wrapped = this.wrap(addedCustom, attrs);
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
      console.log("start", start);
      const length = dependency.length;
      const end = rendered.slice(dependency.index + iOffset + length);
      const template = this.getTemplate(dependency.name);
      if (!template) {
        console.warn("Could not find template: " + dependency.name);
        return;
      }
      console.log("injecting template", template);
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
  addCustomTagScript(rendered) {
    const customTagScript = this._customTags.map((tag) => {
      return `<script src="${tag}"></script>`;
    });
    const addedCustom = `<head>\n${customTagScript.join(
      "\n"
    )}\n</head>\n${rendered}`;
    return addedCustom;
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
    const lines = template.split("\n");
    if (lines.length === 0) {
      return attrs;
    }
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
        attrs[attrMatch[1]] = attrMatch[2];
      }
    });
    return attrs;
  }
}

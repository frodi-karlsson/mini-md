const Builder = require("../../src/Builder");
const Tag = require("../../src/Tag");
const config = require("config");

class HeadBuilder extends Builder {
  constructor() {
    const _tags = new Map([
      ["title", new Tag("title", () => "Default title")],
      ["desc", new Tag("desc", (template) => template.getPureContent())],
      ["scheme", new Tag("scheme", () => "default")],
    ]);

    super(_tags);
  }

  build(template) {
    const title = this.tags.get("title").parse(template.content);
    const desc = this.tags.get("desc").parse(template.content);
    const scheme = this.tags.get("scheme").parse(template.content);

    return {
      index: 0,
      value: `
        <head>
            <title>${title.value}</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            ${this.getScheme(scheme.value)}
            <meta property="og:title" content="${title.value}">
            <meta property="og:type" content="website">
            <meta property="og:url" content="${config.get("Site.og_url")}/${
        template.name
      }">
            <meta property="og:description" content="${desc.value}">
            <link rel="stylesheet" href="styles/styles.css">
            <link rel="stylesheet" href="styles/schemes/${scheme.value}.css">
        </head>
        `,
    };
  }
}

module.exports = HeadBuilder;

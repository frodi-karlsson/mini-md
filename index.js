const express = require("express");
const MarkdownIt = require("markdown-it");
const markdownItCheckbox = require("markdown-it-checkbox");
const { TemplateBuilder } = require("./builders/template-builder.js");
const { HeadBuilder } = require("./builders/head-builder.js");
const { NavBuilder } = require("./builders/nav-builder.js");
const helmet = require("helmet");
const expressRateLimit = require("express-rate-limit");
const config = require("./config.json");

const md = new MarkdownIt();
md.use(markdownItCheckbox);

const app = express();

app.use(helmet());
app.use(
  expressRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests,
  })
);

app.use("/styles", express.static(__dirname + "/styles"));
app.use("/fonts", express.static(__dirname + "/fonts"));
app.use("/assets", express.static(__dirname + "/assets"));

const templateBuilder = new TemplateBuilder("templates");
const templates = templateBuilder.getTemplates();

const index = templateBuilder.getIndexTemplate();
const rest = templates.filter(
  (template) => !config.nav.excluded_sites.includes(template.name)
);
const navBuilder = new NavBuilder(templates);

function makeContent(template) {
  const headBuilder = new HeadBuilder(template.content, template.name);
  const head = headBuilder.getHead();
  const main = md.render(template.content);
  return `
            <!DOCTYPE html>
            <html lang="en">
                ${head}
                <body>
                    ${navBuilder.getNav()}
                    <main>
                        ${main}
                    </main>
                </body>
            </html>
    `;
}

// templates/index.md
app.get("/", (req, res) => {
  res.send(makeContent(index));
});

rest.forEach((template) => {
  app.get("/" + template.name, (req, res) => {
    res.send(makeContent(template));
  });
});

app.get("*", (req, res) => {
  res.status(404).send(makeContent(templateBuilder.get404Template()));
});

app.listen(config.port, () => {
  console.log(`Example app listening at http://localhost:${config.port}`);
});

[//]: # (title="Basic implementation example")
[//]: # (scheme="dark")
[//]: # (description="")
[//]: # (lang="en")
[//]: # (charset="utf-8")

[//]: # (template="shared")

<div class="content">

# Basic implementation example

This is an example of a basic implementation of mini-md.

index.js:
```js
const miniMd = require("mini-md");
miniMd.addRoutes([
    ["/", "index"],
    ["/about", "about"]
]);

miniMd.init();

const port = 3000;

miniMd.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
```

By default, mini-md expects a {project-root}/templates directory that includes a file called index.md and a file called about.md. These files are used to render the pages at / and /about respectively.

index.md:
```md
[//]: # (scheme: default)
# Hello World
```

By default, mini-md expects a {project-root}/styles/schemes directory that includes a file called dark.css. This file is used to style the page at /.

about.md:
```md
[//]: # (scheme: default)
# About
```
Same as above, mini-md is expecting a default.css file in the schemes directory.

This can all be configured in config/*.json.

default.json
```json
{
    "Templates": {
        "dir": "/templates",
        "path": "/templates"
    },
    "Styles": {
        "dir": "/styles",
        "path": "/styles"
    },
    "Scripts": {
        "dir": "/scripts",
        "path": "/scripts"
    },
    "Components": {
        "dir": "/components",
        "path": "/components"
    },
    "Assets": {
        "dir": "/assets",
        "path": "/assets"
    }

}
```

This is the default config file. This gets added to your project when you run `npm install mini-md`.
You can change the values of these keys to change the directories that mini-md looks for files in.
- "dir" is the directory that mini-md looks for files in.
- "path" is the path that mini-md uses to serve files.

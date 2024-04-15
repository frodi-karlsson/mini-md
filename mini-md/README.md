# mini-md

A view engine / template engine for express that can serve your markdown files as HTML.

## Installation

```bash
yarn add mini-md
```

## Syntax

### Templates

You can reference other markdown files in your markdown files by using the following syntax:

```md
[](md:path/to/file.md)
```

You can also use template bindings in your markdown files by using the following syntax:

```md
[](md:path/to/file.md, key=value, key2=value2)
```

The `key=value` pairs are passed to the template engine and can be used in the referenced file:

```md
Key has value: {key}
Key2 has value: {key2}
```

Note that this means you need to escape opening curly braces in your markdown files:
  
```md
This is an opening curly: {curly-open}
```

You can also provide a bindings object to the render function:

```ts
app.get("/", (req, res) => {
  res.render("index.md", { bindings: { key: "value", key2: "value2" } });
});
```

### Modifying the document

You can add \<head> tags straight to your markdown if you supply `html: true` into `mdOptions`:

```ts
app.engine("md", miniMd({ mdOptions: { html: true } }));
```

You can also add attributes to your body and html tags by adding the respective tags in your markdown files with the attributes you want:

```html
<html lang="en" />
<body class="body" />
```

## Usage

In your typescript:

```ts
import express from "express";
import path from "path";
import { miniMd } from "mini-md";

const app = express();
app.engine("md", miniMd());
app.set("views", "views");

app.get("/", (req, res) => {
  res.render("index.md");
});
```

In `./md/fragments/header.md`:

```md
# So long
```

In `./md/index.md`:

```md
[](md:fragments/header.md)

and thanks for all the fish!
```

See the [examples](../examples) if you want to see it in action.

## Todos

- [ ] Test more extensively
- [ ] Simplify the code
- [ ] Make a prettier plugin for the md syntax + html

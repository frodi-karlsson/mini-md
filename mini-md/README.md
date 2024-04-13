# mini-md

A view engine / template engine for express that can serve your markdown files as HTML.

## Installation

```bash
yarn add mini-md
```

## Syntax

You can reference other markdown files in your markdown files by using the following syntax:

```md
[](md:path/to/file.md)
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

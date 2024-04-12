# mini-md

A middleware for express that can serve your markdown files as HTML. It's by no means a polished product, but it's a fun little project that I've been working on.

## Installation

```bash
yarn add mini-md
```

## Usage

In your typescript:

```ts
import express from "express";
import path from "path";
import { miniMd } from "mini-md";

const app = express();
app.use(
  miniMd({
    rootDir: path.resolve(__dirname, "md"),
  })
);

app.listen(3000, () => {
  console.log("Listening on port 3000");
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

See the [examples](../examples) folder for more examples of how to use mini-md.

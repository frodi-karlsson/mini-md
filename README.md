This is a markdown server built on express.js and markdown-it.

It is built to be used either as a standalone server or as an express view engine.

# Usage

### Install

```bash
npm install https://github.com/frodi-karlsson/mini-md.git
```

### Implementing

There are two ways to implement this. You can either use the express view engine or you can use it as a standalone module.

- Express view engine
```js
import express from "express";
import { MiniMd } from "mini-md";

const app = express();
const miniMd = new MiniMd();

app.engine("md", miniMd.engine());
// ... whatever express stuff you want to do
```
This is experimental and fairly untested. It also creates the config files (see below) even if you won't be using it. Config handling is planned to change.

- Standalone module
```js
import { MiniMd } from "mini-md";

const miniMd = new MiniMd();
miniMd.init();
/**
 * Here you can do standard express stuff via miniMd:
 * miniMd.get("/some/path", (req, res) => {
 *    res.send("Hello world!");
 * });
 */
miniMd.listen(3000);
```

As a standalone module, mini-md will serve files according to your config/(whatever name here).json file. A default config file is created when you install mini-md for reference.

# Development
### Install dependencies
First of all you need to install node.js and npm. Then you can install all dependencies with:
```bash
npm install
```
### Run the server
```bash
npm start
```

### Run the demo
```bash
npm run build
npm run demo
```

This is largely built on markdown-it and express.js.

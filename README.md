This is a markdown server built on express.js and markdown-it.

It is built to be used as a standalone server.

# Usage

### Install

```bash
npm i mini-md
```

### Implementing

```js
import { MiniMd } from "mini-md";

const miniMd = new MiniMd();
/*
 * Here you can do standard express stuff via miniMd:
 * miniMd.get("/some/path", (req, res) => {
 *    res.send("Hello world!");
 * });
 *
 * You should probably be using miniMd.addRoutes([path, templateName, method = "get"][])
 * instead for adding routes.
 *
 * You can also use miniMd.use() to add middleware.
 */
miniMd.use(express.static("public"));
miniMd.listen(3000);
```

Mini-md will serve files according to your config/(whatever name here).json file.

Run `npx mini-md` to create a default config file.

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
npm run build-demo
npm run demo
```

There is no test script. Testing should probably be implemented at some point, but for now you can just run the demo and see if it works.

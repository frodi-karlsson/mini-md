# mini-md

A view engine / template engine for express that can serve your markdown files as HTML.

## The Package

See [mini-md](mini-md) for information on the package itself.

## mini-md (mono)

This is a mono repo for mini-md. It contains the following packages:

- [mini-md](mini-md) - The core package for mini-md.
- [Examples](examples) - Examples of mini-md in action.
  - [Basic](examples/basic) - A basic example of mini-md that just serves a markdown file that includes another markdown file.
  - [Advanced](examples/advanced) - An advanced example of mini-md. It serves a markdown file that styles the body tag, adds head tags and uses template bindings.

### Installation

```bash
yarn
```

### Running the examples

```bash
yarn workspace <basic|advanced> dev
```

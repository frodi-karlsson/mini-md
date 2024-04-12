[](md:fragments/head.md)

# Welcome to this advanced example {.welcome}

This is an advanced example of mini-md!{.description}

## What's different?

This example uses a custom CSS file to style the HTML output. The CSS file is linked in the HTML output using a `<link>` tag in the `head` fragment.

## How does it work?

Well, this md file is passing two things to the `mini-md` package:

- The `markdown-it-attrs` plugin
- The `mdOptions` object with the `html` property set to `true`

it's also serving the `public` folder as a static folder, so the `style.css` file can be accessed by the HTML output.

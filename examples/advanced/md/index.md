[](md:fragments/head.md, title=Advanced Example, description=This is an advanced example of mini-md.)
[](md:fragments/body.md)

# Welcome to this advanced example {.welcome}

This is an advanced example of mini-md!{.description}

## What's different?

This example uses a custom CSS file to style the HTML output. The CSS file is linked in the HTML output using a `<link>` tag in the `head` fragment. A cool thing here is the template binding in the `title` tag, where we pass in the title of the document:

```md
[](md:fragments/head.md, title=Advanced Example, description=This is an advanced example of mini-md.)
```

where fragments/head.md is:

```html
````

where fragments/head.md is:

```html
<head>
    <meta name="description" content="This is an advanced example of mini-md." />
    <title>{curly-open}title}</title>
    <link rel="stylesheet" href="style.css" />
</head>
```

The binding is done using the `{curly-open}title}` syntax, which is replaced by the passed value. Note that the head tags are wrapped in <head> tags, which are then included in the document's head tag.

P.S. The `curly-open` is a placeholder for the curly open bracket `{` to prevent it from being interpreted as a template binding. That's how we're able to show the syntax here.

It also uses a body fragment to include attributes in the document's body tag:

```md
[](md:fragments/body.md)
```

where fragments/body.md is:

```html
<body class="body" />
```

## How does it work?

Well, this md file is passing two things to the `mini-md` package:

- The `markdown-it-attrs` plugin
- The `mdOptions` object with the `html` property set to `true`

it's also serving the `public` folder as a static folder, so the `style.css` file can be accessed by the HTML output.

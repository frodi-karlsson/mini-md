[//]: # (title="SEO and metadata")
[//]: # (scheme="dark")
[//]: # (description="SEO is important for websites. Mini-md uses the commant syntax described on the syntax page to add metadata to pages.")
[//]: # (lang="en")
[//]: # (charset="utf-8")

[//]: # (template="shared")

<div class="content">

# SEO and metadata

SEO is important for websites. Mini-md uses the comment syntax described in [syntax](/syntax) to add metadata to pages.

There are a few special fields that wouldn't belong in a meta tag, but are similar in nature. These are:

- `title` is the title of the page. It is used in the title tag and in the navbar.
- `lang` is the language of the page.
- `charset` is the character set of the page.

Examples of meta tags are:

- `description` is the description of the page. It is used in the meta description tag.
- `keywords` is a comma separated list of keywords. It is used in the meta keywords tag.
- `author` is the author of the page. It is used in the meta author tag.

For both of these, the syntax is the same:

```
[//]: # (key="value")
```

It is also possible to combine these into one comment:

```
[//]: # (title="Page title" description="Page description")
```

You may be wondering why you don't just use the meta tags directly. The reason is that the page content is wrapped in various tags, and the meta tags need to be in the head tag.

```

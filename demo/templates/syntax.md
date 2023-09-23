[//]: # (title="Syntax")
[//]: # (scheme="dark")
[//]: # (description="Mini-md obviously uses Markdown, but it also offers a few extra features.")
[//]: # (lang="en")
[//]: # (charset="utf-8")

[//]: # (template="shared")

<div class="content">

# Syntax

Mini-md obviously uses Markdown, but it also offers a few extra features.

### Comment syntax

Mini-md uses comments to add metadata to pages. These comments are in the form of:

```md
[//]: # (key="value")
```

This is used for [metadata](/SEO) and [schemes](/schemes), but also for injecting other templates into pages. This is useful for adding a navbar to every page for example. The syntax for this is:

```md
[//]: # (template="navbar")
```

### Markdown-it-attrs

Mini-md uses the markdown-it-attrs plugin to add classes and ids to elements. This is useful for styling elements with CSS or adding anchors to elements. The syntax for this is:

```md
# Heading {#heading-id .heading-class}
```

### Markdown-it-anchor

Mini-md uses the markdown-it-anchor plugin to add anchors to elements. This automatically adds ids and permalinks to headings. You don't actually have to do anything for this to work, but this is as good a place as any to mention it.

[//]: # (title="Head tags")
[//]: # (scheme="dark")
[//]: # (description="This is a tutorial on how to modify the head using minimd.")

[//]: # (template="shared")

# Head tags

The head tags are the tags that are in the `<head>` of the html document. They are used to add metadata to the page, such as the title, description, and keywords.

## Adding head tags

Head tags can be added to any markdown file using the following comment:
```
[//]: # (name="value")
```
There are a few special head tags that are used by minimd:
- `title` is the title of the page. It is used for the title in the browser tab, and is also used by search engines to determine the title of the page.
- `scheme` is the style document to use for the page.
- `lang` is the language of the page. It is used by search engines to determine the language of the page.
- `charset` is the character set of the page.

These are special in that they aren't meta tags, but as they are similar in nature they are included in this section.
The rest of the tags will be added as `<meta name="name" content="value">` tags.

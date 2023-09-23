[//]: # (title="Sample homepage")
[//]: # (scheme="dark")
[//]: # (description="This is a sample homepage for minimd.")
[//]: # (lang="en")
[//]: # (charset="utf-8")

[//]: # (template="shared")

<div class="content">

# Sample homepage

You can make and edit pages using [Markdown](https://www.markdownguide.org/basic-syntax/).

### Other features:
- Easy [modification](/editing) of the website.
- Nice monochromatic [color schemes to choose from](/schemes).
- Easy title [editing](/titles).
- [File hosting](/files) for images and other files.
- Syntax from Markdown-it plugins markdown-it-attrs and markdown-it-anchor.

### Main page
This is the main page of the website. It is located at `templates/index.md`.
The template directory can be changed in `config/*.json`.

The main page is special as it gets rendered at / instead of /index.
It's also called Home instead of Index in the navbar.


### Navigation bar
The navigation bar is a custom HTMLElement that can be found in `components/nav-component.html`.
The component directory can be changed in `config/*.json`.
Custom components should be defined as script tags in html files so that they can access the global scope of the page. This is necessary for defining custom HTMLElements.
</div>

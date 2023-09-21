[//]: # (title: Changing schemes)
[//]: # (scheme: dark)

# Changing schemes
Changing schemes can be done using comments in the markdown files. The following comment can be added to the top of any markdown file to change the color scheme of that page:
```
[//]: # (scheme: <scheme name>)
```
These schemes are implemented:
- `default` is a light default scheme.
- `dark` is a dark default scheme. It is used for this page for example.

New schemes can be added to a new file `styles/schemes/scheme-name.css`.

This can of course be omitted, in which case the default scheme is used.

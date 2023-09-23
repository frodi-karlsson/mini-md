[//]: # (title="Components")
[//]: # (scheme="dark")
[//]: # (description="There is no custom way to create custom html components in mini-md. You can however make classes that extend HTMLElement and use them in your html files. This is how the navbar is implemented for example.")
[//]: # (lang="en")
[//]: # (charset="utf-8")

[//]: # (template="shared")

<div class="content">

# Components

There is no custom way to create custom html components in mini-md. You can however make classes that
extend HTMLElement and use them in your html files. This is how the navbar is implemented for example.

Syntax for this is:

```js
class MyComponent extends HTMLElement {
    connectedCallback() {
        const name = this.getAttribute("name");
        this.innerHTML = "Hello " + name;
    }
}
customElements.define("my-component", MyComponent);
```

This can be used in html files like this:

```html
<my-component name="World"></my-component>
```

You can also allow content inside your component:

```js
class MyComponent extends HTMLElement {
    connectedCallback() {
        this.attachShadow({mode: "open"});
        const name = this.getAttribute("name");
        const helloDiv = document.createElement("div");
        helloDiv.innerHTML = `
            <style>
                .hello {
                    color: red;
                }
            </style>
            <div class="hello">Hello ${name}</div>
            <slot></slot>
        `;
        this.shadowRoot.appendChild(helloDiv);
    }
}
customElements.define("my-component", MyComponent);
```

This can be used in html files like this:

```html
<my-component name="World">
    <div>How are you?</div>
</my-component>
```

There are some issues with css and shadow doms, but this is handled by mini-md.

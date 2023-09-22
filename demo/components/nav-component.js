/**
 * Takes in attribute templates="name1->path1,name2"
 */
class NavComponent extends HTMLElement {
  connectedCallback() {
    const templates = this.getAttribute("templates");
    const parsedTemplates = templates.split(",").map((template) => {
      let name, path;
      if (template.includes("->")) {
        [name, path] = template.split("->");
      } else {
        name = template;
        path = template;
      }
      if (path.includes("/")) {
        path = path.split("/").pop();
      }
      if (path.includes(".")) {
        path = path.split(".").shift();
      }
      return { name, path };
    });
    const template = document.createElement("template");
    template.innerHTML = `
        <aside class="col-xs-12 col-md-12 col-lg-3 side-menu">
        <nav class="left-nav hidden-xs hidden-sm hidden-md">
            <h3>Contents</h3>
            <ul class="nolist">
            ${parsedTemplates
              .map((template) => {
                return `<li><a href="/${template.path}">-  ${
                  template.name.charAt(0).toUpperCase() + template.name.slice(1)
                }</a></li>`;
              })
              .join("\n")}
            </ul>
        </nav>
        </aside>
        `;
    this.appendChild(template.content.cloneNode(true));
  }
}
window.customElements.define("nav-component", NavComponent);

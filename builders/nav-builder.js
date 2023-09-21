class NavBuilder {
  templates;

  constructor(templates) {
    const indexIndex = templates.indexOf(
      templates.find((template) => template.name === "index")
    );
    if (indexIndex) {
      const index = templates[indexIndex];
      const indexCopy = { ...index };
      indexCopy.path = "";
      indexCopy.name = "Home";
      templates.splice(indexIndex, 1);
      templates.unshift(indexCopy);
    }
    templates = templates.filter((template) => template.name !== "404");
    this.templates = templates;
  }

  getNav() {
    const listItems = this.templates.map((template) => {
      let path = template.path;
      if (path.includes("/")) {
        path = path.split("/").pop();
      }
      if (path.includes(".")) {
        path = path.split(".").shift();
      }
      return `<li><a href="/${path}">-  ${
        template.name.charAt(0).toUpperCase() + template.name.slice(1)
      }</a></li>`;
    });
    return `
        <aside class="col-xs-12 col-md-12 col-lg-3 side-menu">
        <nav class="left-nav hidden-xs hidden-sm hidden-md">
            <h3>Contents</h3>
            <ul class="nolist">
            ${listItems.join("\n")}
            </ul>
        </nav>
        </aside>
        `;
  }
}

module.exports = {
  NavBuilder: NavBuilder,
};

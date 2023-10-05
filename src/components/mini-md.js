/**
 * A custom tag that wraps a page of markdown content
 */
class MiniMarkdownBuilder extends HTMLElement {
  static n = 0;

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    const content = `
        <main>
          <div class="mini-md">
            <slot></slot>
          </div>
        </main>
      `;
    const template = document.createElement("template");
    template.innerHTML = content;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    document.body.classList.add("ready");
  }

  /**
   * Builds the component
   * @param {Window} window The window to build the component in
   * @returns {HTMLElement}
   */
  static buildComponent(window) {
    window.customElements.define("mini-md", MiniMarkdownBuilder);
  }
}
MiniMarkdownBuilder.buildComponent(window);

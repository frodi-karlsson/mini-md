/**
 * A custom tag that wraps a page of markdown content
 */
class MiniMarkdownBuilder extends HTMLElement {
  static n = 0;

  connectedCallback() {
    const title = this.getAttribute("title");
    const lang = this.getAttribute("lang");
    const scheme = this.getAttribute("scheme");
    const charset = this.getAttribute("charset");
    const description = this.getAttribute("description");
    const author = this.getAttribute("author");
    const keywords = this.getAttribute("keywords");
    const viewport = this.getAttribute("viewport");
    const robots = this.getAttribute("robots");
    const ogTitle = this.getAttribute("og:title");
    const ogType = this.getAttribute("og:type");
    const ogUrl = this.getAttribute("og:url");
    const ogDescription = this.getAttribute("og:description");
    const ogImage = this.getAttribute("og:image");
    const twitterCard = this.getAttribute("twitter:card");
    const ogLocale = this.getAttribute("og:locale");
    const ogSiteName = this.getAttribute("og:site_name");
    const twitterImageAlt = this.getAttribute("twitter:image:alt");

    this.attachShadow({ mode: "open" });

    const titleHTML = `<title>${title ?? "Default title"}</title>`;
    const charsetHTML = `<meta charset="${charset ?? "utf-8"}">`;
    const viewportHTML = viewport
      ? `<meta name="viewport" content="${viewport}">`
      : "";
    const descriptionHTML = description
      ? `<meta name="description" content="${description}">`
      : "";
    const authorHTML = author ? `<meta name="author" content="${author}">` : "";
    const keywordsHTML = keywords
      ? `<meta name="keywords" content="${keywords}">`
      : "";
    const robotsHTML = robots ? `<meta name="robots" content="${robots}">` : "";
    const ogTitleHTML = ogTitle
      ? `<meta property="og:title" content="${ogTitle}">`
      : "";
    const ogTypeHTML = ogType
      ? `<meta property="og:type" content="${ogType}">`
      : "";
    const ogUrlHTML = ogUrl
      ? `<meta property="og:url" content="${ogUrl}">`
      : "";
    const ogDescriptionHTML = ogDescription
      ? `<meta property="og:description" content="${ogDescription}">`
      : "";
    const ogImageHTML = ogImage
      ? `<meta property="og:image" content="${ogImage}">`
      : "";
    const twitterCardHTML = twitterCard
      ? `<meta name="twitter:card" content="${twitterCard}">`
      : "";
    const ogLocaleHTML = ogLocale
      ? `<meta property="og:locale" content="${ogLocale}">`
      : "";
    const ogSiteNameHTML = ogSiteName
      ? `<meta property="og:site_name" content="${ogSiteName}">`
      : "";
    const twitterImageAltHTML = twitterImageAlt
      ? `<meta name="twitter:image:alt" content="${twitterImageAlt}">`
      : "";
    const stylesHTML = `<link rel="stylesheet" href="styles/styles.css">`;
    const schemeHTML = scheme
      ? `<link rel="stylesheet" href="styles/schemes/${scheme}.css">`
      : "";

    const head = `
        ${titleHTML}
        ${charsetHTML}
        ${viewportHTML}
        ${descriptionHTML}
        ${authorHTML}
        ${keywordsHTML}
        ${robotsHTML}
        ${ogTitleHTML}
        ${ogTypeHTML}
        ${ogUrlHTML}
        ${ogDescriptionHTML}
        ${ogImageHTML}
        ${twitterCardHTML}
        ${ogLocaleHTML}
        ${ogSiteNameHTML}
        ${twitterImageAltHTML}
        ${stylesHTML}
        ${schemeHTML}
      `;

    const content = `
        <main lang="${lang ?? "en"}">
          <div class="mini-md">
            <slot></slot>
          </div>
        </main>
      `;

    const html = `
        ${stylesHTML}
        ${schemeHTML}
        ${content}
      `;
    const template = document.createElement("template");
    template.innerHTML = html;
    document.head.innerHTML = head;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
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

import MiniMD from "../src/MiniMd.js";

describe("MiniMd", () => {
  /**
   * @type {MiniMD}
   */
  let miniMd;
  beforeEach(() => {
    miniMd = new MiniMD();
  });

  it("should read custom tags from the components directory", () => {
    const tags = miniMd.readComponents();
    expect(tags.length).toBeGreaterThan(0);
    expect(tags[0].includes("<!DOCTYPE html>")).toBe(true);
  });

  it("should read templates from the templates directory", () => {
    const templates = miniMd.readTemplates();
    expect(templates.length).toBe(0);
  });

  it("parseAttrs", () => {
    const content = `# Hello World [//]: # (title="Hello World")`;
    const attrs = miniMd.parseAttrs(content);
    expect(attrs.title).toBe("Hello World");
  });

  it("wrap", () => {
    const content = `Hello World`;
    const wrapped = miniMd.wrap(content, {});
    expect(wrapped).toBe("<mini-md >Hello World</mini-md>");
  });

  it("wrap with attrs", () => {
    const content = `Hello World`;
    const wrapped = miniMd.wrap(content, { title: "Hello World" });
    expect(wrapped).toBe(`<mini-md title="Hello World">Hello World</mini-md>`);
  });

  it("addCustomTagScript", () => {
    const content = `<head></head>`;
    miniMd._components = ["script"];
    const addedCustom = miniMd.getComponents(content);
    expect(addedCustom).toBe(`<head>\nscript</head>`);
  });
});

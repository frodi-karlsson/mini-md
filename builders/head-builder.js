const { SchemeBuilder } = require("./scheme-builder");
const config = require("../config.json");

class HeadBuilder {
    pageContent;
    title;
    name;

    cssPath;
    constructor(pageContent, name) {
        this.pageContent = pageContent;
        this.title = this.getTitle();
        this.name = name;
    }

    getTitle() {
        // [//]: # (title: My Title)
        const commentRegex = /\[\/\/\]: # \(title: (.*)\)/;
        const lines = this.pageContent.split('\n');
        const mapped = lines.map(line => line.match(commentRegex));
        const filtered = mapped.filter(match => match);
        if (filtered.length === 0) {
            throw new Error('No title found');
        }
        const title = filtered[0][1];
        return title;
    }

    getScheme() {
        const schemeBuilder = new SchemeBuilder(this.pageContent);
        const linkTag = schemeBuilder.getLinkTag();
        return linkTag;
    }

    getDesc() {
        // [//]: # (desc: My Desc)
        const commentRegex = /\[\/\/\]: # \(desc: (.*)\)/;
        const lines = this.pageContent.split('\n');
        const mapped = lines.map(line => line.match(commentRegex));
        const filtered = mapped.filter(match => match);
        let desc;
        if (filtered.length === 0) {
            console.log('No desc found, generating from content');
            desc = this.pageContent.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 200);
        } else {
            desc = filtered[0][1];
        }
        return desc;
    }

    getHead() {
        return `
        <head>
            <title>${this.title}</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta property="og:title" content="${this.title}">
            <meta property="og:type" content="website">
            <meta property="og:url" content="${config.site.og_url}/${this.name}">
            <meta property="og:description" content="${this.getDesc()}">
            <link rel="stylesheet" href="styles/styles.css">
            ${this.getScheme()}
        </head>
        `;
    }
}

module.exports = {
    HeadBuilder: HeadBuilder
}

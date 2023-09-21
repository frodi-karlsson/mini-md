class SchemeBuilder {
    content;
    constructor(content) {
        this.content = content;
    }

    getScheme() {
        const commentRegex = /\[\/\/\]: # \(scheme: (.*)\)/;
        const lines = this.content.split('\n');
        const mapped = lines.map(line => line.match(commentRegex));
        const filtered = mapped.filter(match => match);
        if (filtered.length === 0) {
            console.log('No scheme found');
            return;
        }
        const scheme = filtered[0][1];
        return scheme;
    }

    getLinkTag() {
        const scheme = this.getScheme();
        if (!scheme) {
            return '';
        }
        return `<link rel="stylesheet" href="styles/schemes/${scheme}.css">`;
    }
}

module.exports = {
    SchemeBuilder: SchemeBuilder
}

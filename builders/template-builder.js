const fs = require('fs');

class Template {
    name;
    path;
    content;

    constructor(name, path) {
        this.name = name;
        this.path = path;
        let content;
        try {
            content = fs.readFileSync(path, 'utf8')
        } catch (err) {
            console.error(err)
            throw err;
        }

        this.content = content;
    }
}

class TemplateBuilder {
    templates = [];
    dirPath;

    constructor(dirPath) {
        this.dirPath = dirPath;
        this.loadTemplates();
    }

    loadTemplates() {
        let files;
        try {
            files = fs.readdirSync(this.dirPath);
        } catch (err) {
            console.error(err)
            throw err;
        }

        files.forEach(file => {
            if (file.split('.').pop() !== 'md') {
                console.warn('Ignoring non-markdown file: ' + file);
                return;
            }
            const name = file.split('.').shift();
            const path = this.dirPath + '/' + file;
            const template = new Template(name, path);
            this.templates.push(template);
        });
    }

    getTemplates() {
        return this.templates;
    }

    getIndexTemplate() {
        const index = this.templates.find(template => template.name === 'index');
        if (!index) {
            throw new Error('No index template found');
        }
        return index;
    }

    get404Template() {
        const notFound = this.templates.find(template => template.name === '404');
        if (!notFound) {
            throw new Error('No 404 template found');
        }
        return notFound;
    }

}

module.exports = {
    TemplateBuilder,
    Template
};

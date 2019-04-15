"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handlebars = require("handlebars");
const fs_1 = require("../../../utils/fs");
const stack_1 = require("./stack");
class Template extends stack_1.Resource {
    getTemplate() {
        if (!this.template) {
            const raw = fs_1.readFile(this.fileName);
            this.template = Handlebars.compile(raw, {
                preventIndent: true
            });
        }
        return this.template;
    }
    render(context, options) {
        const template = this.getTemplate();
        return template(context, options);
    }
}
exports.Template = Template;
class TemplateStack extends stack_1.ResourceStack {
    constructor() {
        super(Template, /\.hbs$/);
    }
}
exports.TemplateStack = TemplateStack;
class PartialStack extends TemplateStack {
    constructor() {
        super(...arguments);
        this.registeredNames = [];
    }
    activate() {
        if (!super.activate()) {
            return false;
        }
        const resources = this.getAllResources();
        for (let name in resources) {
            if (this.registeredNames.includes(name)) {
                continue;
            }
            this.registeredNames.push(name);
            const partial = resources[name];
            const template = partial.getTemplate();
            Handlebars.registerPartial(name, template);
        }
        return true;
    }
    deactivate() {
        if (!super.deactivate()) {
            return false;
        }
        for (let name of this.registeredNames) {
            Handlebars.unregisterPartial(name);
        }
        this.registeredNames = [];
        return true;
    }
}
exports.PartialStack = PartialStack;
//# sourceMappingURL=templates.js.map
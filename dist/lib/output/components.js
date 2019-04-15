"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const component_1 = require("../utils/component");
exports.Component = component_1.Component;
const index_1 = require("../models/reflections/index");
const events_1 = require("./events");
class RendererComponent extends component_1.AbstractComponent {
}
exports.RendererComponent = RendererComponent;
class ContextAwareRendererComponent extends RendererComponent {
    constructor() {
        super(...arguments);
        this.urlPrefix = /^(http|ftp)s?:\/\//;
    }
    initialize() {
        this.listenTo(this.owner, {
            [events_1.RendererEvent.BEGIN]: this.onBeginRenderer,
            [events_1.PageEvent.BEGIN]: this.onBeginPage
        });
    }
    getRelativeUrl(absolute) {
        if (this.urlPrefix.test(absolute)) {
            return absolute;
        }
        else {
            const relative = Path.relative(Path.dirname(this.location), Path.dirname(absolute));
            return Path.join(relative, Path.basename(absolute)).replace(/\\/g, '/');
        }
    }
    onBeginRenderer(event) {
        this.project = event.project;
    }
    onBeginPage(page) {
        this.location = page.url;
        this.reflection = page.model instanceof index_1.DeclarationReflection ? page.model : undefined;
    }
}
exports.ContextAwareRendererComponent = ContextAwareRendererComponent;
//# sourceMappingURL=components.js.map
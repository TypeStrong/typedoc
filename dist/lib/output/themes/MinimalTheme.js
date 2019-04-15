"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Path = require("path");
const DefaultTheme_1 = require("./DefaultTheme");
const UrlMapping_1 = require("../models/UrlMapping");
const index_1 = require("../../models/reflections/index");
const events_1 = require("../events");
const NavigationItem_1 = require("../models/NavigationItem");
class MinimalTheme extends DefaultTheme_1.DefaultTheme {
    constructor(renderer, basePath) {
        super(renderer, basePath);
        renderer.removeComponent('assets');
        renderer.removeComponent('javascriptIndex');
        renderer.removeComponent('navigation');
        renderer.removeComponent('toc');
        this.listenTo(renderer, events_1.PageEvent.BEGIN, this.onRendererBeginPage);
    }
    isOutputDirectory(path) {
        if (!FS.existsSync(Path.join(path, 'index.html'))) {
            return false;
        }
        return true;
    }
    getUrls(project) {
        const urls = [];
        urls.push(new UrlMapping_1.UrlMapping('index.html', project, 'index.hbs'));
        project.url = 'index.html';
        project.anchor = undefined;
        project.hasOwnDocument = true;
        (project.children || []).forEach((child) => {
            DefaultTheme_1.DefaultTheme.applyAnchorUrl(child, project);
        });
        return urls;
    }
    onRendererBeginPage(page) {
        const model = page.model;
        if (!(model instanceof index_1.Reflection)) {
            return;
        }
        page.toc = new NavigationItem_1.NavigationItem();
        MinimalTheme.buildToc(page.model, page.toc);
    }
    static buildToc(model, parent) {
        const children = model.children || [];
        children.forEach((child) => {
            const item = NavigationItem_1.NavigationItem.create(child, parent, true);
            MinimalTheme.buildToc(child, item);
        });
    }
}
exports.MinimalTheme = MinimalTheme;
//# sourceMappingURL=MinimalTheme.js.map
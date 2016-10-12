"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FS = require("fs");
var Path = require("path");
var DefaultTheme_1 = require("./DefaultTheme");
var UrlMapping_1 = require("../models/UrlMapping");
var index_1 = require("../../models/reflections/index");
var events_1 = require("../events");
var NavigationItem_1 = require("../models/NavigationItem");
var MinimalTheme = (function (_super) {
    __extends(MinimalTheme, _super);
    function MinimalTheme(renderer, basePath) {
        _super.call(this, renderer, basePath);
        renderer.removeComponent('assets');
        renderer.removeComponent('javascriptIndex');
        renderer.removeComponent('navigation');
        renderer.removeComponent('toc');
        this.listenTo(renderer, events_1.PageEvent.BEGIN, this.onRendererBeginPage);
    }
    MinimalTheme.prototype.isOutputDirectory = function (path) {
        if (!FS.existsSync(Path.join(path, 'index.html')))
            return false;
        return true;
    };
    MinimalTheme.prototype.getUrls = function (project) {
        var urls = [];
        urls.push(new UrlMapping_1.UrlMapping('index.html', project, 'index.hbs'));
        project.url = 'index.html';
        project.anchor = null;
        project.hasOwnDocument = true;
        project.children.forEach(function (child) {
            DefaultTheme_1.DefaultTheme.applyAnchorUrl(child, project);
        });
        return urls;
    };
    MinimalTheme.prototype.onRendererBeginPage = function (page) {
        var model = page.model;
        if (!(model instanceof index_1.Reflection)) {
            return;
        }
        page.toc = new NavigationItem_1.NavigationItem();
        MinimalTheme.buildToc(page.model, page.toc);
    };
    MinimalTheme.buildToc = function (model, parent) {
        var children = model.children || [];
        children.forEach(function (child) {
            var item = NavigationItem_1.NavigationItem.create(child, parent, true);
            MinimalTheme.buildToc(child, item);
        });
    };
    return MinimalTheme;
}(DefaultTheme_1.DefaultTheme));
exports.MinimalTheme = MinimalTheme;
//# sourceMappingURL=MinimalTheme.js.map
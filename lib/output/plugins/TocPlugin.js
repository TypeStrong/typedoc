"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var index_1 = require("../../models/reflections/index");
var components_1 = require("../components");
var events_1 = require("../events");
var NavigationItem_1 = require("../models/NavigationItem");
var TocPlugin = (function (_super) {
    __extends(TocPlugin, _super);
    function TocPlugin() {
        _super.apply(this, arguments);
    }
    TocPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[events_1.PageEvent.BEGIN] = this.onRendererBeginPage,
            _a
        ));
        var _a;
    };
    TocPlugin.prototype.onRendererBeginPage = function (page) {
        var model = page.model;
        if (!(model instanceof index_1.Reflection)) {
            return;
        }
        var trail = [];
        while (!(model instanceof index_1.ProjectReflection) && !model.kindOf(index_1.ReflectionKind.SomeModule)) {
            trail.unshift(model);
            model = model.parent;
        }
        page.toc = new NavigationItem_1.NavigationItem();
        TocPlugin.buildToc(model, trail, page.toc);
    };
    TocPlugin.buildToc = function (model, trail, parent) {
        var index = trail.indexOf(model);
        var children = model['children'] || [];
        if (index < trail.length - 1 && children.length > 40) {
            var child = trail[index + 1];
            var item = NavigationItem_1.NavigationItem.create(child, parent, true);
            item.isInPath = true;
            item.isCurrent = false;
            TocPlugin.buildToc(child, trail, item);
        }
        else {
            children.forEach(function (child) {
                if (child.kindOf(index_1.ReflectionKind.SomeModule)) {
                    return;
                }
                var item = NavigationItem_1.NavigationItem.create(child, parent, true);
                if (trail.indexOf(child) != -1) {
                    item.isInPath = true;
                    item.isCurrent = (trail[trail.length - 1] == child);
                    TocPlugin.buildToc(child, trail, item);
                }
            });
        }
    };
    TocPlugin = __decorate([
        components_1.Component({ name: "toc" })
    ], TocPlugin);
    return TocPlugin;
}(components_1.RendererComponent));
exports.TocPlugin = TocPlugin;

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
        components_1.Component({ name: "toc" }), 
        __metadata('design:paramtypes', [])
    ], TocPlugin);
    return TocPlugin;
})(components_1.RendererComponent);
exports.TocPlugin = TocPlugin;

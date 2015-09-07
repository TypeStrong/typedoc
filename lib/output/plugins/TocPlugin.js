var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Renderer_1 = require("../Renderer");
var RendererPlugin_1 = require("../RendererPlugin");
var Reflection_1 = require("../../models/Reflection");
var ProjectReflection_1 = require("../../models/reflections/ProjectReflection");
var NavigationItem_1 = require("../models/NavigationItem");
var TocPlugin = (function (_super) {
    __extends(TocPlugin, _super);
    function TocPlugin(renderer) {
        _super.call(this, renderer);
        renderer.on(Renderer_1.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
    }
    TocPlugin.prototype.onRendererBeginPage = function (page) {
        var model = page.model;
        if (!(model instanceof Reflection_1.Reflection)) {
            return;
        }
        var trail = [];
        while (!(model instanceof ProjectReflection_1.ProjectReflection) && !model.kindOf(Reflection_1.ReflectionKind.SomeModule)) {
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
                if (child.kindOf(Reflection_1.ReflectionKind.SomeModule)) {
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
    return TocPlugin;
})(RendererPlugin_1.RendererPlugin);
exports.TocPlugin = TocPlugin;
Renderer_1.Renderer.registerPlugin('toc', TocPlugin);

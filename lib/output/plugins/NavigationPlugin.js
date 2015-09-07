var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Renderer_1 = require("../Renderer");
var RendererPlugin_1 = require("../RendererPlugin");
var NavigationPlugin = (function (_super) {
    __extends(NavigationPlugin, _super);
    function NavigationPlugin(renderer) {
        _super.call(this, renderer);
        renderer.on(Renderer_1.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
        renderer.on(Renderer_1.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
    }
    NavigationPlugin.prototype.onRendererBegin = function (event) {
        this.navigation = this.renderer.theme.getNavigation(event.project);
    };
    NavigationPlugin.prototype.onRendererBeginPage = function (page) {
        var currentItems = [];
        (function updateItem(item) {
            item.isCurrent = false;
            item.isInPath = false;
            item.isVisible = item.isGlobals;
            if (item.url == page.url || (item.dedicatedUrls && item.dedicatedUrls.indexOf(page.url) != -1)) {
                currentItems.push(item);
            }
            if (item.children) {
                item.children.forEach(function (child) { return updateItem(child); });
            }
        })(this.navigation);
        currentItems.forEach(function (item) {
            item.isCurrent = true;
            var depth = item.isGlobals ? -1 : 0;
            var count = 1;
            while (item) {
                item.isInPath = true;
                item.isVisible = true;
                count += 1;
                depth += 1;
                if (item.children) {
                    count += item.children.length;
                    if (depth < 2 || count < 30) {
                        item.children.forEach(function (child) {
                            child.isVisible = true;
                        });
                    }
                }
                item = item.parent;
            }
        });
        page.navigation = this.navigation;
    };
    return NavigationPlugin;
})(RendererPlugin_1.RendererPlugin);
exports.NavigationPlugin = NavigationPlugin;
Renderer_1.Renderer.registerPlugin('navigation', NavigationPlugin);

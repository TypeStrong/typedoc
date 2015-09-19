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
var components_1 = require("../components");
var events_1 = require("../events");
var NavigationPlugin = (function (_super) {
    __extends(NavigationPlugin, _super);
    function NavigationPlugin() {
        _super.apply(this, arguments);
    }
    NavigationPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[events_1.RendererEvent.BEGIN] = this.onBeginRenderer,
            _a[events_1.PageEvent.BEGIN] = this.onBeginPage,
            _a
        ));
        var _a;
    };
    NavigationPlugin.prototype.onBeginRenderer = function (event) {
        this.navigation = this.owner.theme.getNavigation(event.project);
    };
    NavigationPlugin.prototype.onBeginPage = function (page) {
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
    NavigationPlugin = __decorate([
        components_1.Component({ name: "navigation" }), 
        __metadata('design:paramtypes', [])
    ], NavigationPlugin);
    return NavigationPlugin;
})(components_1.RendererComponent);
exports.NavigationPlugin = NavigationPlugin;

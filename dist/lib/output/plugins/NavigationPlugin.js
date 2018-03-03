"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var components_1 = require("../components");
var events_1 = require("../events");
var NavigationPlugin = (function (_super) {
    __extends(NavigationPlugin, _super);
    function NavigationPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NavigationPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[events_1.RendererEvent.BEGIN] = this.onBeginRenderer,
            _a[events_1.PageEvent.BEGIN] = this.onBeginPage,
            _a));
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
            if (item.url === page.url || (item.dedicatedUrls && item.dedicatedUrls.indexOf(page.url) !== -1)) {
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
        components_1.Component({ name: 'navigation' })
    ], NavigationPlugin);
    return NavigationPlugin;
}(components_1.RendererComponent));
exports.NavigationPlugin = NavigationPlugin;
//# sourceMappingURL=NavigationPlugin.js.map
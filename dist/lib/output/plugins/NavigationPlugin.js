"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../components");
const events_1 = require("../events");
let NavigationPlugin = class NavigationPlugin extends components_1.RendererComponent {
    initialize() {
        this.listenTo(this.owner, {
            [events_1.RendererEvent.BEGIN]: this.onBeginRenderer,
            [events_1.PageEvent.BEGIN]: this.onBeginPage
        });
    }
    onBeginRenderer(event) {
        this.navigation = this.owner.theme.getNavigation(event.project);
    }
    onBeginPage(page) {
        const currentItems = [];
        (function updateItem(item) {
            item.isCurrent = false;
            item.isInPath = false;
            item.isVisible = item.isGlobals;
            if (item.url === page.url || (item.dedicatedUrls && item.dedicatedUrls.includes(page.url))) {
                currentItems.push(item);
            }
            if (item.children) {
                item.children.forEach((child) => updateItem(child));
            }
        })(this.navigation);
        currentItems.forEach((item) => {
            item.isCurrent = true;
            let depth = item.isGlobals ? -1 : 0;
            let count = 1;
            while (item) {
                item.isInPath = true;
                item.isVisible = true;
                count += 1;
                depth += 1;
                if (item.children) {
                    count += item.children.length;
                    if (depth < 2 || count < 30) {
                        item.children.forEach((child) => {
                            child.isVisible = true;
                        });
                    }
                }
                item = item.parent;
            }
        });
        page.navigation = this.navigation;
    }
};
NavigationPlugin = __decorate([
    components_1.Component({ name: 'navigation' })
], NavigationPlugin);
exports.NavigationPlugin = NavigationPlugin;
//# sourceMappingURL=NavigationPlugin.js.map
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
let LayoutPlugin = class LayoutPlugin extends components_1.RendererComponent {
    initialize() {
        this.listenTo(this.owner, events_1.PageEvent.END, this.onRendererEndPage);
    }
    onRendererEndPage(page) {
        const layout = this.owner.theme.resources.layouts.getResource('default').getTemplate();
        page.contents = layout(page);
    }
};
LayoutPlugin = __decorate([
    components_1.Component({ name: 'layout' })
], LayoutPlugin);
exports.LayoutPlugin = LayoutPlugin;
//# sourceMappingURL=LayoutPlugin.js.map
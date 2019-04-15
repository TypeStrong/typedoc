"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("./components");
const component_1 = require("../utils/component");
const resources_1 = require("./utils/resources");
let Theme = class Theme extends components_1.RendererComponent {
    constructor(renderer, basePath) {
        super(renderer);
        this.basePath = basePath;
        this.resources = new resources_1.Resources(this);
    }
};
Theme = __decorate([
    component_1.Component({ name: 'theme', internal: true })
], Theme);
exports.Theme = Theme;
//# sourceMappingURL=theme.js.map
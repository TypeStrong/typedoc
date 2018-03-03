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
var components_1 = require("./components");
var component_1 = require("../utils/component");
var resources_1 = require("./utils/resources");
var Theme = (function (_super) {
    __extends(Theme, _super);
    function Theme(renderer, basePath) {
        var _this = _super.call(this, renderer) || this;
        _this.basePath = basePath;
        _this.resources = new resources_1.Resources(_this);
        return _this;
    }
    Theme.prototype.isOutputDirectory = function (path) {
        return false;
    };
    Theme.prototype.getUrls = function (project) {
        return [];
    };
    Theme.prototype.getNavigation = function (project) {
        return null;
    };
    Theme = __decorate([
        component_1.Component({ name: 'theme', internal: true })
    ], Theme);
    return Theme;
}(components_1.RendererComponent));
exports.Theme = Theme;
//# sourceMappingURL=theme.js.map
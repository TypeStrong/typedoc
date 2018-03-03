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
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var component_1 = require("../utils/component");
exports.Component = component_1.Component;
var index_1 = require("../models/reflections/index");
var events_1 = require("./events");
var RendererComponent = (function (_super) {
    __extends(RendererComponent, _super);
    function RendererComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RendererComponent;
}(component_1.AbstractComponent));
exports.RendererComponent = RendererComponent;
var ContextAwareRendererComponent = (function (_super) {
    __extends(ContextAwareRendererComponent, _super);
    function ContextAwareRendererComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.urlPrefix = /^(http|ftp)s?:\/\//;
        return _this;
    }
    ContextAwareRendererComponent.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[events_1.RendererEvent.BEGIN] = this.onBeginRenderer,
            _a[events_1.PageEvent.BEGIN] = this.onBeginPage,
            _a));
        var _a;
    };
    ContextAwareRendererComponent.prototype.getRelativeUrl = function (absolute) {
        if (this.urlPrefix.test(absolute)) {
            return absolute;
        }
        else {
            var relative = Path.relative(Path.dirname(this.location), Path.dirname(absolute));
            return Path.join(relative, Path.basename(absolute)).replace(/\\/g, '/');
        }
    };
    ContextAwareRendererComponent.prototype.onBeginRenderer = function (event) {
        this.project = event.project;
    };
    ContextAwareRendererComponent.prototype.onBeginPage = function (page) {
        this.location = page.url;
        this.reflection = page.model instanceof index_1.DeclarationReflection ? page.model : null;
    };
    return ContextAwareRendererComponent;
}(RendererComponent));
exports.ContextAwareRendererComponent = ContextAwareRendererComponent;
//# sourceMappingURL=components.js.map
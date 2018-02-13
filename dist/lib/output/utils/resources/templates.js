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
var Handlebars = require("handlebars");
var fs_1 = require("../../../utils/fs");
var stack_1 = require("./stack");
var Template = (function (_super) {
    __extends(Template, _super);
    function Template() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Template.prototype.getTemplate = function () {
        if (!this.template) {
            var raw = fs_1.readFile(this.fileName);
            this.template = Handlebars.compile(raw, {
                preventIndent: true
            });
        }
        return this.template;
    };
    Template.prototype.render = function (context, options) {
        var template = this.getTemplate();
        return template(context, options);
    };
    return Template;
}(stack_1.Resource));
exports.Template = Template;
var TemplateStack = (function (_super) {
    __extends(TemplateStack, _super);
    function TemplateStack() {
        return _super.call(this, Template, /\.hbs$/) || this;
    }
    return TemplateStack;
}(stack_1.ResourceStack));
exports.TemplateStack = TemplateStack;
var PartialStack = (function (_super) {
    __extends(PartialStack, _super);
    function PartialStack() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.registeredNames = [];
        return _this;
    }
    PartialStack.prototype.activate = function () {
        if (!_super.prototype.activate.call(this)) {
            return false;
        }
        var resources = this.getAllResources();
        for (var name_1 in resources) {
            if (this.registeredNames.indexOf(name_1) !== -1) {
                continue;
            }
            this.registeredNames.push(name_1);
            var partial = resources[name_1];
            var template = partial.getTemplate();
            Handlebars.registerPartial(name_1, template);
        }
        return true;
    };
    PartialStack.prototype.deactivate = function () {
        if (!_super.prototype.deactivate.call(this)) {
            return false;
        }
        for (var _i = 0, _a = this.registeredNames; _i < _a.length; _i++) {
            var name_2 = _a[_i];
            Handlebars.unregisterPartial(name_2);
        }
        this.registeredNames = [];
        return true;
    };
    return PartialStack;
}(TemplateStack));
exports.PartialStack = PartialStack;
//# sourceMappingURL=templates.js.map
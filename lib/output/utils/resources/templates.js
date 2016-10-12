"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Handlebars = require("handlebars");
var fs_1 = require("../../../utils/fs");
var stack_1 = require("./stack");
var Template = (function (_super) {
    __extends(Template, _super);
    function Template() {
        _super.apply(this, arguments);
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
        _super.call(this, Template, /\.hbs$/);
    }
    return TemplateStack;
}(stack_1.ResourceStack));
exports.TemplateStack = TemplateStack;
var PartialStack = (function (_super) {
    __extends(PartialStack, _super);
    function PartialStack() {
        _super.apply(this, arguments);
        this.registeredNames = [];
    }
    PartialStack.prototype.activate = function () {
        if (!_super.prototype.activate.call(this))
            return false;
        var resources = this.getAllResources();
        for (var name in resources) {
            if (this.registeredNames.indexOf(name) !== -1)
                continue;
            this.registeredNames.push(name);
            var partial = resources[name];
            var template = partial.getTemplate();
            Handlebars.registerPartial(name, template);
        }
        return true;
    };
    PartialStack.prototype.deactivate = function () {
        if (!_super.prototype.deactivate.call(this))
            return false;
        for (var _i = 0, _a = this.registeredNames; _i < _a.length; _i++) {
            var name = _a[_i];
            Handlebars.unregisterPartial(name);
        }
        this.registeredNames = [];
        return true;
    };
    return PartialStack;
}(TemplateStack));
exports.PartialStack = PartialStack;
//# sourceMappingURL=templates.js.map
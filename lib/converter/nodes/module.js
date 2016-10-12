"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var components_1 = require("../components");
var ModuleConverter = (function (_super) {
    __extends(ModuleConverter, _super);
    function ModuleConverter() {
        _super.apply(this, arguments);
        this.supports = [
            225
        ];
    }
    ModuleConverter.prototype.convert = function (context, node) {
        var _this = this;
        var parent = context.scope;
        var reflection = index_2.createDeclaration(context, node, index_1.ReflectionKind.Module);
        context.withScope(reflection, function () {
            var opt = context.getCompilerOptions();
            if (parent instanceof index_1.ProjectReflection && !context.isDeclaration &&
                (!module || module.valueOf() === ts.ModuleKind.None.valueOf())) {
                reflection.setFlag(index_1.ReflectionFlag.Exported);
            }
            if (node.body) {
                _this.owner.convertNode(context, node.body);
            }
        });
        return reflection;
    };
    ModuleConverter = __decorate([
        components_1.Component({ name: 'node:module' })
    ], ModuleConverter);
    return ModuleConverter;
}(components_1.ConverterNodeComponent));
exports.ModuleConverter = ModuleConverter;
//# sourceMappingURL=module.js.map
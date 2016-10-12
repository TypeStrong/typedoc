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
var index_1 = require("../../models/types/index");
var components_1 = require("../components");
var TypeParameterConverter = (function (_super) {
    __extends(TypeParameterConverter, _super);
    function TypeParameterConverter() {
        _super.apply(this, arguments);
        this.priority = -50;
    }
    TypeParameterConverter.prototype.supportsNode = function (context, node, type) {
        return !!(type.flags & 16384);
    };
    TypeParameterConverter.prototype.convertNode = function (context, node) {
        if (node.typeName) {
            var name = ts.getTextOfNode(node.typeName);
            if (context.typeParameters && context.typeParameters[name]) {
                return context.typeParameters[name].clone();
            }
            var result = new index_1.TypeParameterType();
            result.name = name;
            return result;
        }
    };
    TypeParameterConverter = __decorate([
        components_1.Component({ name: 'type:type-parameter' })
    ], TypeParameterConverter);
    return TypeParameterConverter;
}(components_1.ConverterTypeComponent));
exports.TypeParameterConverter = TypeParameterConverter;
//# sourceMappingURL=type-parameter.js.map
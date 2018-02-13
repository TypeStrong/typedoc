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
var converter_1 = require("../converter");
var components_1 = require("../components");
var ConstructorConverter = (function (_super) {
    __extends(ConstructorConverter, _super);
    function ConstructorConverter() {
        _super.apply(this, arguments);
        this.supports = [
            145,
            149
        ];
    }
    ConstructorConverter.prototype.convert = function (context, node) {
        var parent = context.scope;
        var hasBody = !!node.body;
        var method = index_2.createDeclaration(context, node, index_1.ReflectionKind.Constructor, 'constructor');
        if (node.parameters && node.parameters.length) {
            var comment = method ? method.comment : index_2.createComment(node);
            for (var _i = 0, _a = node.parameters; _i < _a.length; _i++) {
                var parameter = _a[_i];
                this.addParameterProperty(context, parameter, comment);
            }
        }
        context.withScope(method, function () {
            if (!hasBody || !method.signatures) {
                var name = 'new ' + parent.name;
                var signature = index_2.createSignature(context, node, name, index_1.ReflectionKind.ConstructorSignature);
                signature.type = new index_1.ReferenceType(parent.name, index_1.ReferenceType.SYMBOL_ID_RESOLVED, parent);
                method.signatures = method.signatures || [];
                method.signatures.push(signature);
            }
            else {
                context.trigger(converter_1.Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
            }
        });
        return method;
    };
    ConstructorConverter.prototype.addParameterProperty = function (context, parameter, comment) {
        var visibility = parameter.flags & (8 | 32 | 16);
        if (!visibility)
            return;
        var property = index_2.createDeclaration(context, parameter, index_1.ReflectionKind.Property);
        if (!property)
            return;
        property.setFlag(index_1.ReflectionFlag.Static, false);
        property.type = this.owner.convertType(context, parameter.type, context.getTypeAtLocation(parameter));
        if (comment) {
            var tag = comment.getTag('param', property.name);
            if (tag && tag.text) {
                property.comment = new index_1.Comment(tag.text);
            }
        }
    };
    ConstructorConverter = __decorate([
        components_1.Component({ name: 'node:constructor' })
    ], ConstructorConverter);
    return ConstructorConverter;
}(components_1.ConverterNodeComponent));
exports.ConstructorConverter = ConstructorConverter;

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
var InterfaceConverter = (function (_super) {
    __extends(InterfaceConverter, _super);
    function InterfaceConverter() {
        _super.apply(this, arguments);
        this.supports = [
            222
        ];
    }
    InterfaceConverter.prototype.convert = function (context, node) {
        var _this = this;
        var reflection;
        if (context.isInherit && context.inheritParent == node) {
            reflection = context.scope;
        }
        else {
            reflection = index_2.createDeclaration(context, node, index_1.ReflectionKind.Interface);
        }
        context.withScope(reflection, node.typeParameters, function () {
            if (node.members) {
                node.members.forEach(function (member, isInherit) {
                    _this.owner.convertNode(context, member);
                });
            }
            var baseTypes = ts.getInterfaceBaseTypeNodes(node);
            if (baseTypes) {
                baseTypes.forEach(function (baseType) {
                    var type = context.getTypeAtLocation(baseType);
                    if (!context.isInherit) {
                        if (!reflection.extendedTypes)
                            reflection.extendedTypes = [];
                        reflection.extendedTypes.push(_this.owner.convertType(context, baseType, type));
                    }
                    if (type && type.symbol) {
                        type.symbol.declarations.forEach(function (declaration) {
                            context.inherit(declaration, baseType.typeArguments);
                        });
                    }
                });
            }
        });
        return reflection;
    };
    InterfaceConverter = __decorate([
        components_1.Component({ name: 'node:interface' })
    ], InterfaceConverter);
    return InterfaceConverter;
}(components_1.ConverterNodeComponent));
exports.InterfaceConverter = InterfaceConverter;
//# sourceMappingURL=interface.js.map
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
var ClassConverter = (function (_super) {
    __extends(ClassConverter, _super);
    function ClassConverter() {
        _super.apply(this, arguments);
        this.supports = [
            189,
            217
        ];
    }
    ClassConverter.prototype.convert = function (context, node) {
        var _this = this;
        var reflection;
        if (context.isInherit && context.inheritParent == node) {
            reflection = context.scope;
        }
        else {
            reflection = index_2.createDeclaration(context, node, index_1.ReflectionKind.Class);
        }
        context.withScope(reflection, node.typeParameters, function () {
            if (node.members) {
                node.members.forEach(function (member) {
                    _this.owner.convertNode(context, member);
                });
            }
            var baseType = ts.getClassExtendsHeritageClauseElement(node);
            if (baseType) {
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
            }
            var implementedTypes = ts.getClassImplementsHeritageClauseElements(node);
            if (implementedTypes) {
                implementedTypes.forEach(function (implementedType) {
                    if (!reflection.implementedTypes) {
                        reflection.implementedTypes = [];
                    }
                    reflection.implementedTypes.push(_this.owner.convertType(context, implementedType));
                });
            }
        });
        return reflection;
    };
    ClassConverter = __decorate([
        components_1.Component({ name: 'node:class' })
    ], ClassConverter);
    return ClassConverter;
}(components_1.ConverterNodeComponent));
exports.ClassConverter = ClassConverter;

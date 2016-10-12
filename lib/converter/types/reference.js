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
var index_2 = require("../../models/reflections/index");
var index_3 = require("../factories/index");
var components_1 = require("../components");
var converter_1 = require("../converter");
var ReferenceConverter = (function (_super) {
    __extends(ReferenceConverter, _super);
    function ReferenceConverter() {
        _super.apply(this, arguments);
        this.priority = -50;
    }
    ReferenceConverter.prototype.supportsNode = function (context, node, type) {
        return !!(type.flags & 2588672);
    };
    ReferenceConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 2588672);
    };
    ReferenceConverter.prototype.convertNode = function (context, node, type) {
        var _this = this;
        if (!type.symbol) {
            return new index_1.IntrinsicType('Object');
        }
        else if (type.symbol.flags & 2048 || type.symbol.flags & 4096) {
            return this.convertLiteral(context, type.symbol, node);
        }
        var result = index_3.createReferenceType(context, type.symbol);
        if (node.typeArguments) {
            result.typeArguments = node.typeArguments.map(function (n) { return _this.owner.convertType(context, n); });
        }
        return result;
    };
    ReferenceConverter.prototype.convertType = function (context, type) {
        var _this = this;
        if (!type.symbol) {
            return new index_1.IntrinsicType('Object');
        }
        else if (type.symbol.flags & 2048 || type.symbol.flags & 4096) {
            return this.convertLiteral(context, type.symbol);
        }
        var result = index_3.createReferenceType(context, type.symbol);
        if (type.typeArguments) {
            result.typeArguments = type.typeArguments.map(function (t) { return _this.owner.convertType(context, null, t); });
        }
        return result;
    };
    ReferenceConverter.prototype.convertLiteral = function (context, symbol, node) {
        var _this = this;
        for (var _i = 0, _a = symbol.declarations; _i < _a.length; _i++) {
            var declaration_1 = _a[_i];
            if (context.visitStack.indexOf(declaration_1) !== -1) {
                if (declaration_1.kind == 159 ||
                    declaration_1.kind == 171) {
                    return index_3.createReferenceType(context, declaration_1.parent.symbol);
                }
                else {
                    return index_3.createReferenceType(context, declaration_1.symbol);
                }
            }
        }
        var declaration = new index_2.DeclarationReflection();
        declaration.kind = index_2.ReflectionKind.TypeLiteral;
        declaration.name = '__type';
        declaration.parent = context.scope;
        context.registerReflection(declaration, null, symbol);
        context.trigger(converter_1.Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, function () {
            symbol.declarations.forEach(function (node) {
                _this.owner.convertNode(context, node);
            });
        });
        return new index_1.ReflectionType(declaration);
    };
    ReferenceConverter = __decorate([
        components_1.Component({ name: 'type:reference' })
    ], ReferenceConverter);
    return ReferenceConverter;
}(components_1.ConverterTypeComponent));
exports.ReferenceConverter = ReferenceConverter;
//# sourceMappingURL=reference.js.map
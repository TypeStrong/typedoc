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
var ts = require("typescript");
var index_1 = require("../../models/index");
var components_1 = require("../components");
var converter_1 = require("../converter");
var BindingObjectConverter = (function (_super) {
    __extends(BindingObjectConverter, _super);
    function BindingObjectConverter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BindingObjectConverter.prototype.supportsNode = function (context, node) {
        return node.kind === ts.SyntaxKind.ObjectBindingPattern;
    };
    BindingObjectConverter.prototype.convertNode = function (context, node) {
        var _this = this;
        var declaration = new index_1.DeclarationReflection();
        declaration.kind = index_1.ReflectionKind.TypeLiteral;
        declaration.name = '__type';
        declaration.parent = context.scope;
        context.registerReflection(declaration, null);
        context.trigger(converter_1.Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, function () {
            node.elements.forEach(function (element) {
                _this.owner.convertNode(context, element);
            });
        });
        return new index_1.ReflectionType(declaration);
    };
    BindingObjectConverter = __decorate([
        components_1.Component({ name: 'type:binding-object' })
    ], BindingObjectConverter);
    return BindingObjectConverter;
}(components_1.ConverterTypeComponent));
exports.BindingObjectConverter = BindingObjectConverter;
//# sourceMappingURL=binding-object.js.map
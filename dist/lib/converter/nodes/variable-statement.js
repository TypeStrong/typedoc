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
var _ts = require("../../ts-internal");
var components_1 = require("../components");
var VariableStatementConverter = (function (_super) {
    __extends(VariableStatementConverter, _super);
    function VariableStatementConverter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.supports = [
            ts.SyntaxKind.VariableStatement
        ];
        return _this;
    }
    VariableStatementConverter.prototype.convert = function (context, node) {
        var _this = this;
        if (node.declarationList && node.declarationList.declarations) {
            node.declarationList.declarations.forEach(function (variableDeclaration) {
                if (_ts.isBindingPattern(variableDeclaration.name)) {
                    _this.convertBindingPattern(context, variableDeclaration.name);
                }
                else {
                    _this.owner.convertNode(context, variableDeclaration);
                }
            });
        }
        return context.scope;
    };
    VariableStatementConverter.prototype.convertBindingPattern = function (context, node) {
        var _this = this;
        node.elements.forEach(function (element) {
            _this.owner.convertNode(context, element);
            if (_ts.isBindingPattern(element.name)) {
                _this.convertBindingPattern(context, element.name);
            }
        });
    };
    VariableStatementConverter = __decorate([
        components_1.Component({ name: 'node:variable-statement' })
    ], VariableStatementConverter);
    return VariableStatementConverter;
}(components_1.ConverterNodeComponent));
exports.VariableStatementConverter = VariableStatementConverter;
//# sourceMappingURL=variable-statement.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ts = require("typescript");
var components_1 = require("../components");
var VariableStatementConverter = (function (_super) {
    __extends(VariableStatementConverter, _super);
    function VariableStatementConverter() {
        _super.apply(this, arguments);
        this.supports = [
            191
        ];
    }
    VariableStatementConverter.prototype.convert = function (context, node) {
        var _this = this;
        if (node.declarationList && node.declarationList.declarations) {
            node.declarationList.declarations.forEach(function (variableDeclaration) {
                if (ts.isBindingPattern(variableDeclaration.name)) {
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
            if (ts.isBindingPattern(element.name)) {
                _this.convertBindingPattern(context, element.name);
            }
        });
    };
    VariableStatementConverter = __decorate([
        components_1.Component({ name: 'node:variable-statement' }), 
        __metadata('design:paramtypes', [])
    ], VariableStatementConverter);
    return VariableStatementConverter;
})(components_1.ConverterNodeComponent);
exports.VariableStatementConverter = VariableStatementConverter;

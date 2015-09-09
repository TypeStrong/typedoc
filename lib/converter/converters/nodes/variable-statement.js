var ts = require("typescript");
var node_1 = require("../node");
var VariableStatementConverter = (function () {
    function VariableStatementConverter() {
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
                    node_1.convertNode(context, variableDeclaration);
                }
            });
        }
        return context.scope;
    };
    VariableStatementConverter.prototype.convertBindingPattern = function (context, node) {
        var _this = this;
        node.elements.forEach(function (element) {
            node_1.convertNode(context, element);
            if (ts.isBindingPattern(element.name)) {
                _this.convertBindingPattern(context, element.name);
            }
        });
    };
    return VariableStatementConverter;
})();
exports.VariableStatementConverter = VariableStatementConverter;

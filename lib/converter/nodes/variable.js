var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var index_3 = require("../index");
var VariableConverter = (function () {
    function VariableConverter() {
        this.supports = [
            138,
            139,
            243,
            244,
            209,
            161
        ];
    }
    VariableConverter.prototype.isSimpleObjectLiteral = function (objectLiteral) {
        if (!objectLiteral.properties)
            return true;
        return objectLiteral.properties.length == 0;
    };
    VariableConverter.prototype.convert = function (context, node) {
        var _this = this;
        var comment = index_2.createComment(node);
        if (comment && comment.hasTag("resolve")) {
            var resolveType = context.getTypeAtLocation(node);
            if (resolveType && resolveType.symbol) {
                var resolved = index_3.convertNode(context, resolveType.symbol.declarations[0]);
                if (resolved) {
                    resolved.name = node.symbol.name;
                }
                return resolved;
            }
        }
        var name, isBindingPattern;
        if (ts.isBindingPattern(node.name)) {
            if (node['propertyName']) {
                name = ts.declarationNameToString(node['propertyName']);
                isBindingPattern = true;
            }
            else {
                return null;
            }
        }
        var scope = context.scope;
        var kind = scope.kind & index_1.ReflectionKind.ClassOrInterface ? index_1.ReflectionKind.Property : index_1.ReflectionKind.Variable;
        var variable = index_2.createDeclaration(context, node, kind, name);
        context.withScope(variable, function () {
            if (node.initializer) {
                switch (node.initializer.kind) {
                    case 172:
                    case 171:
                        variable.kind = scope.kind & index_1.ReflectionKind.ClassOrInterface ? index_1.ReflectionKind.Method : index_1.ReflectionKind.Function;
                        index_3.convertNode(context, node.initializer);
                        break;
                    case 163:
                        if (!_this.isSimpleObjectLiteral(node.initializer)) {
                            variable.kind = index_1.ReflectionKind.ObjectLiteral;
                            variable.type = new index_1.IntrinsicType('object');
                            index_3.convertNode(context, node.initializer);
                        }
                        break;
                    default:
                        variable.defaultValue = index_3.convertDefaultValue(node);
                }
            }
            if (variable.kind == kind || variable.kind == index_1.ReflectionKind.Event) {
                if (isBindingPattern) {
                    variable.type = index_3.convertType(context, node.name);
                }
                else {
                    variable.type = index_3.convertType(context, node.type, context.getTypeAtLocation(node));
                }
            }
        });
        return variable;
    };
    return VariableConverter;
})();
exports.VariableConverter = VariableConverter;

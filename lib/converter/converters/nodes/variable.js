var ts = require("typescript");
var Reflection_1 = require("../../../models/Reflection");
var node_1 = require("../node");
var declaration_1 = require("../factories/declaration");
var expression_1 = require("../expression");
var type_1 = require("../type");
var comment_1 = require("../factories/comment");
var IntrinsicType_1 = require("../../../models/types/IntrinsicType");
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
        var comment = comment_1.createComment(node);
        if (comment && comment.hasTag("resolve")) {
            var resolveType = context.getTypeAtLocation(node);
            if (resolveType && resolveType.symbol) {
                var resolved = node_1.convertNode(context, resolveType.symbol.declarations[0]);
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
        var kind = scope.kind & Reflection_1.ReflectionKind.ClassOrInterface ? Reflection_1.ReflectionKind.Property : Reflection_1.ReflectionKind.Variable;
        var variable = declaration_1.createDeclaration(context, node, kind, name);
        context.withScope(variable, function () {
            if (node.initializer) {
                switch (node.initializer.kind) {
                    case 172:
                    case 171:
                        variable.kind = scope.kind & Reflection_1.ReflectionKind.ClassOrInterface ? Reflection_1.ReflectionKind.Method : Reflection_1.ReflectionKind.Function;
                        node_1.convertNode(context, node.initializer);
                        break;
                    case 163:
                        if (!_this.isSimpleObjectLiteral(node.initializer)) {
                            variable.kind = Reflection_1.ReflectionKind.ObjectLiteral;
                            variable.type = new IntrinsicType_1.IntrinsicType('object');
                            node_1.convertNode(context, node.initializer);
                        }
                        break;
                    default:
                        variable.defaultValue = expression_1.convertDefaultValue(node);
                }
            }
            if (variable.kind == kind || variable.kind == Reflection_1.ReflectionKind.Event) {
                if (isBindingPattern) {
                    variable.type = type_1.convertType(context, node.name);
                }
                else {
                    variable.type = type_1.convertType(context, node.type, context.getTypeAtLocation(node));
                }
            }
        });
        return variable;
    };
    return VariableConverter;
})();
exports.VariableConverter = VariableConverter;

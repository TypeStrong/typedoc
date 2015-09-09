var ts = require("typescript");
var Converter_1 = require("../../Converter");
var Reflection_1 = require("../../../models/Reflection");
var node_1 = require("../node");
var declaration_1 = require("../factories/declaration");
var prefered = [
    212,
    213,
    215
];
var BlockConverter = (function () {
    function BlockConverter() {
        this.supports = [
            190,
            217,
            246
        ];
    }
    BlockConverter.prototype.convert = function (context, node) {
        if (node.kind == 246) {
            this.convertSourceFile(context, node);
        }
        else {
            this.convertStatements(context, node);
        }
        return context.scope;
    };
    BlockConverter.prototype.convertStatements = function (context, node) {
        if (node.statements) {
            var statements = [];
            node.statements.forEach(function (statement) {
                if (prefered.indexOf(statement.kind) != -1) {
                    node_1.convertNode(context, statement);
                }
                else {
                    statements.push(statement);
                }
            });
            statements.forEach(function (statement) {
                node_1.convertNode(context, statement);
            });
        }
    };
    BlockConverter.prototype.convertSourceFile = function (context, node) {
        var _this = this;
        var result = context.scope;
        var options = context.getOptions();
        context.withSourceFile(node, function () {
            if (options.mode == Converter_1.SourceFileMode.Modules) {
                result = declaration_1.createDeclaration(context, node, Reflection_1.ReflectionKind.ExternalModule, node.fileName);
                context.withScope(result, function () {
                    _this.convertStatements(context, node);
                    result.setFlag(Reflection_1.ReflectionFlag.Exported);
                });
            }
            else {
                _this.convertStatements(context, node);
            }
        });
        return result;
    };
    return BlockConverter;
})();
exports.BlockConverter = BlockConverter;

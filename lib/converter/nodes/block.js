var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var converter_1 = require("../converter");
var convert_node_1 = require("../convert-node");
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
    BlockConverter.prototype.convertSourceFile = function (context, node) {
        var _this = this;
        var result = context.scope;
        var options = context.getOptions();
        context.withSourceFile(node, function () {
            if (options.mode == converter_1.SourceFileMode.Modules) {
                result = index_2.createDeclaration(context, node, index_1.ReflectionKind.ExternalModule, node.fileName);
                context.withScope(result, function () {
                    _this.convertStatements(context, node);
                    result.setFlag(index_1.ReflectionFlag.Exported);
                });
            }
            else {
                _this.convertStatements(context, node);
            }
        });
        return result;
    };
    BlockConverter.prototype.convertStatements = function (context, node) {
        if (node.statements) {
            var statements = [];
            node.statements.forEach(function (statement) {
                if (prefered.indexOf(statement.kind) != -1) {
                    convert_node_1.convertNode(context, statement);
                }
                else {
                    statements.push(statement);
                }
            });
            statements.forEach(function (statement) {
                convert_node_1.convertNode(context, statement);
            });
        }
    };
    return BlockConverter;
})();
exports.BlockConverter = BlockConverter;

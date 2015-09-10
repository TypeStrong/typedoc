var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var convert_node_1 = require("../convert-node");
var ModuleConverter = (function () {
    function ModuleConverter() {
        this.supports = [
            216
        ];
    }
    ModuleConverter.prototype.convert = function (context, node) {
        var parent = context.scope;
        var reflection = index_2.createDeclaration(context, node, index_1.ReflectionKind.Module);
        context.withScope(reflection, function () {
            var opt = context.getCompilerOptions();
            if (parent instanceof index_1.ProjectReflection && !context.isDeclaration &&
                (!opt.module || opt.module == 0)) {
                reflection.setFlag(index_1.ReflectionFlag.Exported);
            }
            if (node.body) {
                convert_node_1.convertNode(context, node.body);
            }
        });
        return reflection;
    };
    return ModuleConverter;
})();
exports.ModuleConverter = ModuleConverter;

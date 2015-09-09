var ts = require("typescript");
var Reflection_1 = require("../../../models/Reflection");
var node_1 = require("../node");
var declaration_1 = require("../factories/declaration");
var ProjectReflection_1 = require("../../../models/reflections/ProjectReflection");
var ModuleConverter = (function () {
    function ModuleConverter() {
        this.supports = [
            216
        ];
    }
    ModuleConverter.prototype.convert = function (context, node) {
        var parent = context.scope;
        var reflection = declaration_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Module);
        context.withScope(reflection, function () {
            var opt = context.getCompilerOptions();
            if (parent instanceof ProjectReflection_1.ProjectReflection && !context.isDeclaration &&
                (!opt.module || opt.module == 0)) {
                reflection.setFlag(Reflection_1.ReflectionFlag.Exported);
            }
            if (node.body) {
                node_1.convertNode(context, node.body);
            }
        });
        return reflection;
    };
    return ModuleConverter;
})();
exports.ModuleConverter = ModuleConverter;

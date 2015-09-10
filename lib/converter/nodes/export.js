var ts = require("typescript");
var index_1 = require("../../models/index");
var ExportConverter = (function () {
    function ExportConverter() {
        this.supports = [
            225
        ];
    }
    ExportConverter.prototype.convert = function (context, node) {
        if (!node.isExportEquals) {
            return context.scope;
        }
        var type = context.getTypeAtLocation(node.expression);
        if (type && type.symbol) {
            var project = context.project;
            type.symbol.declarations.forEach(function (declaration) {
                if (!declaration.symbol)
                    return;
                var id = project.symbolMapping[context.getSymbolID(declaration.symbol)];
                if (!id)
                    return;
                var reflection = project.reflections[id];
                if (reflection instanceof index_1.DeclarationReflection) {
                    reflection.setFlag(index_1.ReflectionFlag.ExportAssignment, true);
                }
                markAsExported(reflection);
            });
        }
        function markAsExported(reflection) {
            if (reflection instanceof index_1.DeclarationReflection) {
                reflection.setFlag(index_1.ReflectionFlag.Exported, true);
            }
            reflection.traverse(markAsExported);
        }
        return context.scope;
    };
    return ExportConverter;
})();
exports.ExportConverter = ExportConverter;

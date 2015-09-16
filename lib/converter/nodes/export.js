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
var index_1 = require("../../models/index");
var components_1 = require("../components");
var ExportConverter = (function (_super) {
    __extends(ExportConverter, _super);
    function ExportConverter() {
        _super.apply(this, arguments);
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
    ExportConverter = __decorate([
        components_1.Component({ name: 'node:export' }), 
        __metadata('design:paramtypes', [])
    ], ExportConverter);
    return ExportConverter;
})(components_1.ConverterNodeComponent);
exports.ExportConverter = ExportConverter;

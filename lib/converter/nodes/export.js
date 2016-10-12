"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ts = require("typescript");
var index_1 = require("../../models/index");
var components_1 = require("../components");
var ExportConverter = (function (_super) {
    __extends(ExportConverter, _super);
    function ExportConverter() {
        _super.apply(this, arguments);
        this.supports = [
            235
        ];
    }
    ExportConverter.prototype.convert = function (context, node) {
        var symbol = undefined;
        if (node.symbol && (node.symbol.flags & 8388608) === 8388608) {
            symbol = context.checker.getAliasedSymbol(node.symbol);
        }
        else {
            var type = context.getTypeAtLocation(node.expression);
            symbol = type ? type.symbol : undefined;
        }
        if (symbol) {
            var project = context.project;
            symbol.declarations.forEach(function (declaration) {
                if (!declaration.symbol)
                    return;
                var id = project.symbolMapping[context.getSymbolID(declaration.symbol)];
                if (!id)
                    return;
                var reflection = project.reflections[id];
                if (node.isExportEquals && reflection instanceof index_1.DeclarationReflection) {
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
        components_1.Component({ name: 'node:export' })
    ], ExportConverter);
    return ExportConverter;
}(components_1.ConverterNodeComponent));
exports.ExportConverter = ExportConverter;
//# sourceMappingURL=export.js.map
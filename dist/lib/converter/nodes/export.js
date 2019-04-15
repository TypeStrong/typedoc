"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const index_1 = require("../../models/index");
const components_1 = require("../components");
const factories_1 = require("../factories");
let ExportConverter = class ExportConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.ExportAssignment,
            ts.SyntaxKind.ExportDeclaration
        ];
    }
    _convertExportAllDeclaration(context, moduleSpecifier) {
        const symbol = context.checker.getSymbolAtLocation(moduleSpecifier);
        if (!symbol) {
            return context.scope;
        }
        const valueDeclaration = symbol.valueDeclaration;
        if (!valueDeclaration) {
            return context.scope;
        }
        if (!ts.isSourceFile(valueDeclaration)) {
            return context.scope;
        }
        valueDeclaration.statements.forEach((statement) => {
            this.owner.convertNode(context, statement);
        });
        return context.scope;
    }
    _convertExportDeclaration(context, node) {
        if (node.moduleSpecifier) {
            return this._convertExportAllDeclaration(context, node.moduleSpecifier);
        }
        if (!node.exportClause) {
            return context.scope;
        }
        node.exportClause.elements.forEach((element) => {
            const exportedSymbol = context.checker.getSymbolAtLocation(element.name);
            if (exportedSymbol) {
                const originalSymbol = context.checker.getAliasedSymbol(exportedSymbol);
                const declarations = originalSymbol.getDeclarations();
                if (declarations) {
                    declarations.forEach((declaration) => {
                        if (ts.isSourceFile(declaration)) {
                            const reflection = factories_1.createDeclaration(context, element.name, index_1.ReflectionKind.Module, exportedSymbol.name);
                            if (reflection) {
                                reflection.setFlag(index_1.ReflectionFlag.Exported);
                                context.withScope(reflection, () => {
                                    declaration.statements.forEach((statement) => {
                                        this.owner.convertNode(context, statement);
                                    });
                                });
                            }
                        }
                        else {
                            const reflection = this.owner.convertNode(context, declaration);
                            if (reflection) {
                                reflection.setFlag(index_1.ReflectionFlag.Exported);
                                reflection.name = exportedSymbol.name;
                            }
                        }
                    });
                }
            }
        });
        return context.scope;
    }
    convert(context, node) {
        if (ts.isExportDeclaration(node)) {
            return this._convertExportDeclaration(context, node);
        }
        let symbol;
        if (node.symbol && (node.symbol.flags & ts.SymbolFlags.Alias) === ts.SymbolFlags.Alias) {
            symbol = context.checker.getAliasedSymbol(node.symbol);
        }
        else {
            let type = context.getTypeAtLocation(node.expression);
            symbol = type ? type.symbol : undefined;
        }
        if (symbol && symbol.declarations) {
            const project = context.project;
            symbol.declarations.forEach((declaration) => {
                if (!declaration.symbol) {
                    return;
                }
                const id = project.symbolMapping[context.getSymbolID(declaration.symbol)];
                if (!id) {
                    return;
                }
                const reflection = project.reflections[id];
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
    }
};
ExportConverter = __decorate([
    components_1.Component({ name: 'node:export' })
], ExportConverter);
exports.ExportConverter = ExportConverter;
//# sourceMappingURL=export.js.map
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
const index_2 = require("../factories/index");
const components_1 = require("../components");
const component_1 = require("../../utils/component");
const declaration_1 = require("../../utils/options/declaration");
const preferred = [
    ts.SyntaxKind.ClassDeclaration,
    ts.SyntaxKind.InterfaceDeclaration,
    ts.SyntaxKind.EnumDeclaration
];
var SourceFileMode;
(function (SourceFileMode) {
    SourceFileMode[SourceFileMode["File"] = 0] = "File";
    SourceFileMode[SourceFileMode["Modules"] = 1] = "Modules";
})(SourceFileMode = exports.SourceFileMode || (exports.SourceFileMode = {}));
let BlockConverter = class BlockConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.Block,
            ts.SyntaxKind.ModuleBlock,
            ts.SyntaxKind.SourceFile
        ];
    }
    convert(context, node) {
        if (node.kind === ts.SyntaxKind.SourceFile) {
            this.convertSourceFile(context, node);
        }
        else {
            this.convertStatements(context, node);
        }
        return context.scope;
    }
    convertSourceFile(context, node) {
        let result = context.scope;
        context.withSourceFile(node, () => {
            if (this.mode === SourceFileMode.Modules) {
                result = index_2.createDeclaration(context, node, index_1.ReflectionKind.ExternalModule, node.fileName);
                context.withScope(result, () => {
                    this.convertStatements(context, node);
                    result.setFlag(index_1.ReflectionFlag.Exported);
                });
            }
            else {
                this.convertStatements(context, node);
            }
        });
        return result;
    }
    convertStatements(context, node) {
        if (node.statements) {
            const statements = [];
            node.statements.forEach((statement) => {
                if (preferred.includes(statement.kind)) {
                    this.owner.convertNode(context, statement);
                }
                else {
                    statements.push(statement);
                }
            });
            statements.forEach((statement) => {
                this.owner.convertNode(context, statement);
            });
        }
    }
};
__decorate([
    component_1.Option({
        name: 'mode',
        help: "Specifies the output mode the project is used to be compiled with: 'file' or 'modules'",
        type: declaration_1.ParameterType.Map,
        map: {
            'file': SourceFileMode.File,
            'modules': SourceFileMode.Modules
        },
        defaultValue: SourceFileMode.Modules
    })
], BlockConverter.prototype, "mode", void 0);
BlockConverter = __decorate([
    components_1.Component({ name: 'node:block' })
], BlockConverter);
exports.BlockConverter = BlockConverter;
//# sourceMappingURL=block.js.map
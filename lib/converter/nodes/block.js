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
var index_2 = require("../factories/index");
var components_1 = require("../components");
var component_1 = require("../../utils/component");
var declaration_1 = require("../../utils/options/declaration");
var prefered = [
    221,
    222,
    224
];
(function (SourceFileMode) {
    SourceFileMode[SourceFileMode["File"] = 0] = "File";
    SourceFileMode[SourceFileMode["Modules"] = 1] = "Modules";
})(exports.SourceFileMode || (exports.SourceFileMode = {}));
var SourceFileMode = exports.SourceFileMode;
var BlockConverter = (function (_super) {
    __extends(BlockConverter, _super);
    function BlockConverter() {
        _super.apply(this, arguments);
        this.supports = [
            199,
            226,
            256
        ];
    }
    BlockConverter.prototype.convert = function (context, node) {
        if (node.kind == 256) {
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
        context.withSourceFile(node, function () {
            if (_this.mode == SourceFileMode.Modules) {
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
        var _this = this;
        if (node.statements) {
            var statements = [];
            node.statements.forEach(function (statement) {
                if (prefered.indexOf(statement.kind) != -1) {
                    _this.owner.convertNode(context, statement);
                }
                else {
                    statements.push(statement);
                }
            });
            statements.forEach(function (statement) {
                _this.owner.convertNode(context, statement);
            });
        }
    };
    __decorate([
        component_1.Option({
            name: "mode",
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
    return BlockConverter;
}(components_1.ConverterNodeComponent));
exports.BlockConverter = BlockConverter;
//# sourceMappingURL=block.js.map
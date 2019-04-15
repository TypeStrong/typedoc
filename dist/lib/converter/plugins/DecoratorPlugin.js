"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const index_1 = require("../../models/types/index");
const components_1 = require("../components");
const converter_1 = require("../converter");
let DecoratorPlugin = class DecoratorPlugin extends components_1.ConverterComponent {
    initialize() {
        this.listenTo(this.owner, {
            [converter_1.Converter.EVENT_BEGIN]: this.onBegin,
            [converter_1.Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
            [converter_1.Converter.EVENT_CREATE_PARAMETER]: this.onDeclaration,
            [converter_1.Converter.EVENT_RESOLVE]: this.onBeginResolve
        });
    }
    extractArguments(args, signature) {
        const result = {};
        args.forEach((arg, index) => {
            if (index < signature.parameters.length) {
                const parameter = signature.parameters[index];
                result[parameter.name] = arg.getText();
            }
            else {
                if (!result['...']) {
                    result['...'] = [];
                }
                result['...'].push(arg.getText());
            }
        });
        return result;
    }
    onBegin(context) {
        this.usages = {};
    }
    onDeclaration(context, reflection, node) {
        if (!node || !node.decorators) {
            return;
        }
        node.decorators.forEach((decorator) => {
            let callExpression;
            let identifier;
            switch (decorator.expression.kind) {
                case ts.SyntaxKind.Identifier:
                    identifier = decorator.expression;
                    break;
                case ts.SyntaxKind.CallExpression:
                    callExpression = decorator.expression;
                    identifier = callExpression.expression;
                    break;
                default:
                    return;
            }
            const info = {
                name: identifier.getText()
            };
            const type = context.checker.getTypeAtLocation(identifier);
            if (type && type.symbol) {
                const symbolID = context.getSymbolID(type.symbol);
                info.type = new index_1.ReferenceType(info.name, symbolID);
                if (callExpression && callExpression.arguments) {
                    const signature = context.checker.getResolvedSignature(callExpression);
                    if (signature) {
                        info.arguments = this.extractArguments(callExpression.arguments, signature);
                    }
                }
                if (!this.usages[symbolID]) {
                    this.usages[symbolID] = [];
                }
                this.usages[symbolID].push(new index_1.ReferenceType(reflection.name, index_1.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
            }
            if (!reflection.decorators) {
                reflection.decorators = [];
            }
            reflection.decorators.push(info);
        });
    }
    onBeginResolve(context) {
        for (let symbolID in this.usages) {
            if (!this.usages.hasOwnProperty(symbolID)) {
                continue;
            }
            const id = context.project.symbolMapping[symbolID];
            if (!id) {
                continue;
            }
            const reflection = context.project.reflections[id];
            if (reflection) {
                reflection.decorates = this.usages[symbolID];
            }
        }
    }
};
DecoratorPlugin = __decorate([
    components_1.Component({ name: 'decorator' })
], DecoratorPlugin);
exports.DecoratorPlugin = DecoratorPlugin;
//# sourceMappingURL=DecoratorPlugin.js.map
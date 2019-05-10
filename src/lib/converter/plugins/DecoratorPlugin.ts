import * as ts from 'typescript';
import * as _ts from '../../ts-internal';

import { ReferenceType } from '../../models/types/index';
import { Reflection, Decorator } from '../../models/reflections/index';
import { Component, ConverterComponent } from '../components';
import { Converter } from '../converter';
import { Context } from '../context';

/**
 * A plugin that detects decorators.
 */
@Component({name: 'decorator'})
export class DecoratorPlugin extends ConverterComponent {
    /**
     * Defined in this.onBegin
     */
    private usages!: {[symbolID: number]: ReferenceType[]};

    /**
     * Create a new ImplementsPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_BEGIN]:              this.onBegin,
            [Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
            [Converter.EVENT_CREATE_PARAMETER]:   this.onDeclaration,
            [Converter.EVENT_RESOLVE]:            this.onBeginResolve
        });
    }

    /**
     * Create an object describing the arguments a decorator is set with.
     *
     * @param args  The arguments resolved from the decorator's call expression.
     * @param signature  The signature definition of the decorator being used.
     * @returns An object describing the decorator parameters,
     */
    private extractArguments(args: ts.NodeArray<ts.Expression>, signature: ts.Signature): { [name: string]: string | string[] } {
        const result = {};
        args.forEach((arg: ts.Expression, index: number) => {
            if (index < signature.parameters.length) {
                const parameter = signature.parameters[index];
                result[parameter.name] = arg.getText();
            } else {
                if (!result['...']) {
                    result['...'] = [];
                }
                result['...'].push(arg.getText());
            }
        });

        return result;
    }

    /**
     * Triggered when the converter begins converting a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onBegin(context: Context) {
        this.usages = {};
    }

    /**
     * Triggered when the converter has created a declaration or signature reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently processed.
     * @param node  The node that is currently processed if available.
     */
    private onDeclaration(context: Context, reflection: Reflection, node?: ts.Node) {
        if (!node || !node.decorators) {
            return;
        }
        node.decorators.forEach((decorator: ts.Decorator) => {
            let callExpression: ts.CallExpression | undefined;
            let identifier: ts.Expression;

            switch (decorator.expression.kind) {
                case ts.SyntaxKind.Identifier:
                    identifier = decorator.expression;
                    break;
                case ts.SyntaxKind.CallExpression:
                    callExpression = <ts.CallExpression> decorator.expression;
                    identifier = callExpression.expression;
                    break;
                default:
                    return;
            }

            const info: Decorator = {
                name: identifier.getText()
            };

            const type = context.checker.getTypeAtLocation(identifier);
            if (type && type.symbol) {
                const symbolID = context.getSymbolID(type.symbol)!;
                info.type = new ReferenceType(info.name, symbolID);

                if (callExpression && callExpression.arguments) {
                    const signature = context.checker.getResolvedSignature(callExpression);
                    if (signature) {
                        info.arguments = this.extractArguments(callExpression.arguments, signature);
                    }
                }

                if (!this.usages[symbolID]) {
                    this.usages[symbolID] = [];
                }
                this.usages[symbolID].push(new ReferenceType(reflection.name, ReferenceType.SYMBOL_ID_RESOLVED, reflection));
            }

            if (!reflection.decorators) {
                reflection.decorators = [];
            }
            reflection.decorators.push(info);
        });
    }

    /**
     * Triggered when the converter resolves a reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently resolved.
     */
    private onBeginResolve(context: Context) {
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
}

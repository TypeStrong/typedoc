module td.converter
{
    /**
     * A plugin that detects decorators.
     */
    export class DecoratorPlugin extends ConverterPlugin
    {
        private usages:{[symbolID:number]:models.ReferenceType[]};


        /**
         * Create a new ImplementsPlugin instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            super(converter);
            converter.on(Converter.EVENT_BEGIN, this.onBegin, this);
            converter.on(Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
            converter.on(Converter.EVENT_RESOLVE, this.onBeginResolve, this);
        }


        /**
         * Create an object describing the arguments a decorator is set with.
         *
         * @param args  The arguments resolved from the decorator's call expression.
         * @param signature  The signature definition of the decorator being used.
         * @returns An object describing the decorator parameters,
         */
        private extractArguments(args:ts.NodeArray<ts.Expression>, signature:ts.Signature):any {
            var result = {};
            args.forEach((arg:ts.Expression, index:number) => {
                if (index < signature.parameters.length) {
                    var parameter = signature.parameters[index];
                    result[parameter.name] = ts.getTextOfNode(arg);
                } else {
                    if (!result['...']) result['...'] = [];
                    result['...'].push(ts.getTextOfNode(arg));
                }
            });

            return result;
        }


        /**
         * Triggered when the converter begins converting a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBegin(context:Context) {
            this.usages = {};
        }


        /**
         * Triggered when the converter has created a declaration or signature reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onDeclaration(context:Context, reflection:models.Reflection, node?:ts.Node) {
            if (!node || !node.decorators) return;
            node.decorators.forEach((decorator:ts.Decorator) => {
                var callExpression:ts.CallExpression;
                var identifier:ts.Expression;

                switch (decorator.expression.kind) {
                    case ts.SyntaxKind.Identifier:
                        identifier = decorator.expression;
                        break;
                    case ts.SyntaxKind.CallExpression:
                        callExpression = <ts.CallExpression>decorator.expression;
                        identifier = callExpression.expression;
                        break;
                    default:
                        return;
                }

                var info:models.IDecorator = {
                    name: ts.getTextOfNode(identifier)
                };

                var type = context.checker.getTypeAtLocation(identifier);
                if (type && type.symbol) {
                    var symbolID = context.getSymbolID(type.symbol);
                    info.type = new models.ReferenceType(info.name, symbolID);

                    if (callExpression && callExpression.arguments) {
                        var signature = context.checker.getResolvedSignature(callExpression);
                        if (signature) {
                            info.arguments = this.extractArguments(callExpression.arguments, signature);
                        }
                    }

                    if (!this.usages[symbolID]) this.usages[symbolID] = [];
                    this.usages[symbolID].push(new models.ReferenceType(reflection.name, models.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
                }

                if (!reflection.decorators) reflection.decorators = [];
                reflection.decorators.push(info);
            });
        }


        /**
         * Triggered when the converter resolves a reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently resolved.
         */
        private onBeginResolve(context:Context) {
            for (var symbolID in this.usages) {
                if (!this.usages.hasOwnProperty(symbolID)) continue;

                var id = context.project.symbolMapping[symbolID];
                if (!id) continue;

                var reflection = context.project.reflections[id];
                if (reflection) {
                    reflection.decorates = this.usages[symbolID];
                }
            }
        }
    }


    /**
     * Register this handler.
     */
    Converter.registerPlugin('decorator', DecoratorPlugin);
}
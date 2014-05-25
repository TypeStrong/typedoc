module TypeDoc.Factories
{
    /**
     * A factory that copies basic values from declarations to reflections.
     *
     * This factory sets the following values on reflection models:
     *  - flags
     *  - kind
     *  - type
     *  - definition
     *  - isOptional
     *  - defaultValue
     */
    export class ReflectionHandler
    {
        /**
         * A list of fags that should be exported to the flagsArray property.
         */
        static RELEVANT_FLAGS = [
            TypeScript.PullElementFlags.Optional,
            TypeScript.PullElementFlags.Public,
            TypeScript.PullElementFlags.Private,
            TypeScript.PullElementFlags.Static
        ];

        /**
         * A list of fags that should be exported to the flagsArray property for parameter reflections.
         */
        static RELEVANT_PARAMETER_FLAGS = [
            TypeScript.PullElementFlags.Optional
        ];


        constructor(private dispatcher:Dispatcher) {
            dispatcher.on('createReflection', this.onCreateReflection, this);
            dispatcher.on('mergeReflection', this.onMergeReflection, this);
            dispatcher.on('resolveReflection', this.onResolveReflection, this);
        }


        private onCreateReflection(state:DeclarationState) {
            state.reflection.flags = state.declaration.flags;
            state.reflection.kind  = state.declaration.kind;

            var symbol = state.declaration.getSymbol();
            if (symbol) {
                state.reflection.type = createType(symbol.type);
                state.reflection.definition = symbol.toString();
                state.reflection.isOptional = symbol.isOptional;

                if (symbol.type.kind == Models.Kind.ObjectType || symbol.type.kind == Models.Kind.ObjectLiteral) {
                    var typeDeclaration = symbol.type.getDeclarations()[0];
                    typeDeclaration.getChildDecls().forEach((declaration) => {
                        var typeState = state.createChildState(declaration);
                        typeState.isFlattened   = true;
                        typeState.flattenedName = state.getName();
                        this.dispatcher.processState(typeState);
                    });
                }

                if (state.declaration.kind == Models.Kind.Parameter) {
                    var ast = (<TypeScript.Parameter>state.declaration.ast()).equalsValueClause;
                    if (ast) {
                        var snapshot = state.getSnapshot(ast.fileName());
                        var source = snapshot.getText(ast.start(), ast.end());
                        source = source.replace(/^[\s=]+|\s+$/g, '');
                        state.reflection.defaultValue = source;
                    }
                }
            } else {
                state.reflection.definition = state.reflection.name;
            }
        }


        private onMergeReflection(state:DeclarationState) {
            if (state.declaration.kind != Models.Kind.Container) {
                state.reflection.kind = state.declaration.kind;
            }
        }


        /**
         * Triggered by the dispatcher for each reflection in the resolving phase.
         *
         * @param reflection  The final generated reflection.
         */
        private onResolveReflection(reflection:Models.DeclarationReflection) {
            var flagsArray = [];
            var flags = reflection.kindOf(Models.Kind.Parameter) ? ReflectionHandler.RELEVANT_PARAMETER_FLAGS : ReflectionHandler.RELEVANT_FLAGS;
            flags.forEach((key) => {
                if ((reflection.flags & key) == key) {
                    flagsArray.push(TypeScript.PullElementFlags[key].toLowerCase());
                }
            });

            var isExported = false, target = reflection;
            if (target.kindOf(Models.Kind.SomeContainer)) isExported = true;
            while (!isExported && target && target instanceof Models.DeclarationReflection) {
                if (target.kindOf(Models.Kind.SomeContainer)) break;
                isExported = ((target.flags & Models.Flags.Exported) == Models.Flags.Exported);
                target = <Models.DeclarationReflection>target.parent;
            }

            reflection.flagsArray = flagsArray;
            reflection.isExported = isExported;
            reflection.isStatic   = ((reflection.flags & Models.Flags.Static)  == Models.Flags.Static);
            reflection.isPrivate  = ((reflection.flags & Models.Flags.Private) == Models.Flags.Private);
        }
    }


    Dispatcher.FACTORIES.push(ReflectionHandler);
}
module TypeDoc.Factories
{
    /**
     * A handler that sets the most basic reflection properties.
     */
    export class ReflectionHandler extends BaseHandler
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


        /**
         * Create a new ReflectionHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_CREATE_REFLECTION, this.onCreateReflection, this);
            dispatcher.on(Dispatcher.EVENT_MERGE_REFLECTION,  this.onMergeReflection,  this);
            dispatcher.on(Dispatcher.EVENT_RESOLVE,           this.onResolve,          this);
        }


        /**
         * Triggered when the dispatcher creates a new reflection instance.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onCreateReflection(state:DeclarationState) {
            state.reflection.flags      = state.declaration.flags;
            state.reflection.kind       = state.declaration.kind;
            state.reflection.isExternal = state.isExternal;

            var symbol = state.declaration.getSymbol();
            if (symbol) {
                state.reflection.type = TypeHandler.createType(symbol.type);
                state.reflection.definition = symbol.toString();
                state.reflection.isOptional = symbol.isOptional;

                if (symbol.type && (symbol.type.kind == Models.Kind.ObjectType || symbol.type.kind == Models.Kind.ObjectLiteral)) {
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


        /**
         * Triggered when the dispatcher merges an existing reflection with a new declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onMergeReflection(state:DeclarationState) {
            state.reflection.isExternal = state.isExternal && state.reflection.isExternal;

            if (state.declaration.kind != Models.Kind.Container) {
                state.reflection.kind = state.declaration.kind;
            }
        }


        /**
         * Triggered by the dispatcher for each reflection in the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onResolve(event:ReflectionEvent) {
            var reflection = event.reflection;
            var flagsArray = [];
            var flags = reflection.kindOf(Models.Kind.Parameter) ? ReflectionHandler.RELEVANT_PARAMETER_FLAGS : ReflectionHandler.RELEVANT_FLAGS;
            flags.forEach((key) => {
                if ((reflection.flags & key) == key) {
                    flagsArray.push(TypeScript.PullElementFlags[key].toLowerCase());
                }
            });

            var isExported = false, target = reflection;
            if (target.kindOf(Models.Kind.SomeContainer)) {
                isExported = true;
            }

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


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(ReflectionHandler);
}
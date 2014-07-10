module TypeDoc.Factories
{
    export interface IReflectionHandlerMergeStrategy {
        reflection?:TypeScript.PullElementKind[];
        declaration?:TypeScript.PullElementKind[];
        actions:Function[];
    }


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
         * A weighted list of element kinds used by [[mergeKinds]] to determine the importance of kinds.
         */
        static KIND_WEIGHTS = [
            TypeScript.PullElementKind.AcceptableAlias,
            TypeScript.PullElementKind.CallSignature,
            TypeScript.PullElementKind.CatchBlock,
            TypeScript.PullElementKind.CatchVariable,
            TypeScript.PullElementKind.ConstructSignature,
            TypeScript.PullElementKind.ConstructorMethod,
            TypeScript.PullElementKind.ConstructorType,
            TypeScript.PullElementKind.EnumMember,
            TypeScript.PullElementKind.Function,
            TypeScript.PullElementKind.FunctionExpression,
            TypeScript.PullElementKind.FunctionType,
            TypeScript.PullElementKind.GetAccessor,
            TypeScript.PullElementKind.Global,
            TypeScript.PullElementKind.IndexSignature,
            TypeScript.PullElementKind.Method,
            TypeScript.PullElementKind.None,
            TypeScript.PullElementKind.ObjectType,
            TypeScript.PullElementKind.Parameter,
            TypeScript.PullElementKind.Primitive,
            TypeScript.PullElementKind.Script,
            TypeScript.PullElementKind.SetAccessor,
            TypeScript.PullElementKind.TypeAlias,
            TypeScript.PullElementKind.TypeParameter,
            TypeScript.PullElementKind.WithBlock,

            TypeScript.PullElementKind.Variable,
            TypeScript.PullElementKind.Property,
            TypeScript.PullElementKind.Enum,
            TypeScript.PullElementKind.ObjectLiteral,
            TypeScript.PullElementKind.Container,
            TypeScript.PullElementKind.Interface,
            TypeScript.PullElementKind.Class,
            TypeScript.PullElementKind.DynamicModule
        ];

        /**
         * A weighted list of element kinds used by [[mergeKinds]] to determine the importance of kinds.
         */
        static KIND_PROCESS_ORDER = [
            TypeScript.PullElementKind.Variable,

            TypeScript.PullElementKind.AcceptableAlias,
            TypeScript.PullElementKind.CallSignature,
            TypeScript.PullElementKind.CatchBlock,
            TypeScript.PullElementKind.CatchVariable,
            TypeScript.PullElementKind.ConstructSignature,
            TypeScript.PullElementKind.ConstructorMethod,
            TypeScript.PullElementKind.ConstructorType,
            TypeScript.PullElementKind.EnumMember,
            TypeScript.PullElementKind.FunctionExpression,
            TypeScript.PullElementKind.FunctionType,
            TypeScript.PullElementKind.GetAccessor,
            TypeScript.PullElementKind.Global,
            TypeScript.PullElementKind.IndexSignature,
            TypeScript.PullElementKind.Method,
            TypeScript.PullElementKind.None,
            TypeScript.PullElementKind.ObjectType,
            TypeScript.PullElementKind.Parameter,
            TypeScript.PullElementKind.Primitive,
            TypeScript.PullElementKind.Script,
            TypeScript.PullElementKind.SetAccessor,
            TypeScript.PullElementKind.TypeAlias,
            TypeScript.PullElementKind.TypeParameter,
            TypeScript.PullElementKind.WithBlock,
            TypeScript.PullElementKind.Property,
            TypeScript.PullElementKind.Enum,
            TypeScript.PullElementKind.ObjectLiteral,
            TypeScript.PullElementKind.Interface,
            TypeScript.PullElementKind.Class,
            TypeScript.PullElementKind.DynamicModule,

            TypeScript.PullElementKind.Container,
            TypeScript.PullElementKind.Function
        ];


        static MERGE_STRATEGY:IReflectionHandlerMergeStrategy[] = [{
            reflection:  [TypeScript.PullElementKind.Function],
            declaration: [TypeScript.PullElementKind.Container],
            actions:     [ReflectionHandler.convertFunctionToCallSignature]
        }, {
            reflection:  [TypeScript.PullElementKind.Container],
            declaration: [TypeScript.PullElementKind.Variable],
            actions:     [ReflectionHandler.implementVariableType]
        }];


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
            ReflectionHandler.MERGE_STRATEGY.forEach((strategy) => {
                if (strategy.reflection && !state.reflection.kindOf(strategy.reflection)) return;
                if (strategy.declaration && !state.kindOf(strategy.declaration)) return;
                strategy.actions.forEach((action) => action(state));
            });

            state.reflection.isExternal = state.isExternal && state.reflection.isExternal;
            state.reflection.kind       = ReflectionHandler.mergeKinds(state.reflection.kind, state.declaration.kind);
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


        /**
         * Convert the reflection of the given state to a call signature.
         *
         * Applied when a function is merged with a container.
         *
         * @param state  The state whose reflection should be converted to a call signature.
         */
        static convertFunctionToCallSignature(state:DeclarationState) {
            var reflection = state.reflection;
            var name = reflection.name;
            reflection.kind = TypeScript.PullElementKind.CallSignature;
            reflection.name = '';
            reflection.signatures.forEach((signature) => {
                signature.name = '';
            });

            var index = reflection.parent.children.indexOf(reflection);
            reflection.parent.children.splice(index, 1);

            state.reflection = null;
            state.dispatcher.ensureReflection(state);

            reflection.parent = state.reflection;
            state.reflection.children.push(reflection);
            state.reflection.name = name;
        }


        /**
         * Applied when a container is merged with a variable.
         *
         * @param state
         */
        static implementVariableType(state:DeclarationState) {
            state.reflection.kind = TypeScript.PullElementKind.ObjectLiteral;

            var symbol = state.declaration.getSymbol();
            if (symbol && symbol.type) {
                var declaration = symbol.type.getDeclarations();
                symbol.type.getDeclarations().forEach((declaration) => {
                    ReflectionHandler.sortDeclarations(declaration.getChildDecls()).forEach((declaration) => {
                        state.dispatcher.processState(state.createChildState(declaration));
                    });
                });
            }
        }


        /**
         * Sort the given list of declarations for being correctly processed.
         *
         * @param declarations  The list of declarations that should be processed.
         * @returns             The sorted list.
         */
        static sortDeclarations(declarations:TypeScript.PullDecl[]):TypeScript.PullDecl[] {
            return declarations.sort((left:TypeScript.PullDecl, right:TypeScript.PullDecl) => {
                if (left.kind == right.kind) return 0;

                var leftWeight  = ReflectionHandler.KIND_PROCESS_ORDER.indexOf(left.kind);
                var rightWeight = ReflectionHandler.KIND_PROCESS_ORDER.indexOf(right.kind);
                if (leftWeight == rightWeight) {
                    return 0;
                } else {
                    return leftWeight > rightWeight ? -1 : 1;
                }
            });
        }


        /**
         * Merge two kind definitions.
         *
         * @param left   The left kind to merge.
         * @param right  The right kind to merge.
         */
        static mergeKinds(left:TypeScript.PullElementKind, right:TypeScript.PullElementKind):TypeScript.PullElementKind {
            if (left == right) {
                return left;
            }

            var leftWeight  = ReflectionHandler.KIND_WEIGHTS.indexOf(left);
            var rightWeight = ReflectionHandler.KIND_WEIGHTS.indexOf(right);
            if (leftWeight < rightWeight) {
                return right;
            } else {
                return left;
            }
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(ReflectionHandler);
}
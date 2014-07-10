module TypeDoc.Factories
{
    /**
     * A handler that converts all instances of [[LateResolvingType]] to their renderable equivalents.
     */
    export class TypeHandler extends BaseHandler
    {
        /**
         * Map of created named types for reuse.
         */
        static stringConstantTypes:{[name:string]:Models.StringConstantType} = {};

        /**
         * Map of created named types for reuse.
         */
        static namedTypes:{[name:string]:Models.NamedType} = {};


        /**
         * Create a new TypeHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_RESOLVE, this.onResolve, this);
        }


        /**
         * Triggered by the dispatcher for each reflection in the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onResolve(event:ReflectionEvent) {
            var reflection = event.reflection;
            var compiler   = event.compiler;

            reflection.type          = this.resolveType(reflection.type, compiler);
            reflection.inheritedFrom = this.resolveType(reflection.inheritedFrom, compiler);
            reflection.overwrites    = this.resolveType(reflection.overwrites, compiler);
            reflection.extendedTypes = this.resolveTypes(reflection.extendedTypes, compiler);
            reflection.extendedBy    = this.resolveTypes(reflection.extendedBy, compiler);
            reflection.typeHierarchy = TypeHandler.buildTypeHierarchy(reflection);
        }


        /**
         * Resolve the given array of types.
         *
         * This is a utility function which calls [[resolveType]] on all elements of the array.
         *
         * @param types     The array of types that should be resolved.
         * @param compiler  The compiler used by the dispatcher.
         * @returns         The given array with resolved types.
         */
        private resolveTypes(types:Models.BaseType[], compiler:Compiler):Models.BaseType[] {
            if (!types) return types;
            for (var i = 0, c = types.length; i < c; i++) {
                types[i] = this.resolveType(types[i], compiler);
            }
            return types;
        }


        /**
         * Resolve the given type.
         *
         * Only instances of [[Models.LateResolvingType]] will be resolved. This function tries
         * to generate an instance of [[Models.ReflectionType]].
         *
         * @param type      The type that should be resolved.
         * @param compiler  The compiler used by the dispatcher.
         * @returns         The resolved type.
         */
        private resolveType(type:Models.BaseType, compiler:Compiler):Models.BaseType {
            if (!type) return type;
            if (!(type instanceof Models.LateResolvingType)) return type;

            var isArray = false;
            var symbol = (<Models.LateResolvingType>type).symbol;
            if (!symbol) return undefined;

            var declaration;
            if (symbol.isArrayNamedTypeReference()) {
                declaration = symbol.getElementType().getDeclarations()[0];
                isArray = true;
            } else {
                declaration = (<Models.LateResolvingType>type).declaration;
            }

            var declID     = declaration.declID;
            var reflection = compiler.idMap[declID];
            if (reflection) {
                if (reflection.kindOf(Models.Kind.SomeSignature)) {
                    reflection = <Models.DeclarationReflection>reflection.parent;
                }
                return new Models.ReflectionType(reflection, isArray);
            } else {
                if (symbol.fullName() == '') {
                    return TypeHandler.createNamedType(symbol.toString());
                } else {
                    return TypeHandler.createNamedType(symbol.fullName());
                }
            }
        }


        /**
         * Return the simplified type hierarchy for the given reflection.
         *
         * @TODO Type hierarchies for interfaces with multiple parent interfaces.
         *
         * @param reflection The reflection whose type hierarchy should be generated.
         * @returns The root of the generated type hierarchy.
         */
        static buildTypeHierarchy(reflection:Models.DeclarationReflection):Models.IDeclarationHierarchy {
            if (!reflection.extendedTypes && !reflection.extendedBy) {
                return null;
            }

            var root:Models.IDeclarationHierarchy;
            var hierarchy:Models.IDeclarationHierarchy;
            function push(types:Models.BaseType[]) {
                var level = {types:types};
                if (hierarchy) {
                    hierarchy.next = level;
                    hierarchy = level;
                } else {
                    root = hierarchy = level;
                }
            }


            if (reflection.extendedTypes) {
                push(reflection.extendedTypes);
            }

            push([new Models.ReflectionType(reflection, false)]);
            hierarchy.isTarget = true;

            if (reflection.extendedBy) {
                push(reflection.extendedBy);
            }

            return root;
        }


        /**
         * Create a type instance for the given symbol.
         *
         * The following native TypeScript types are not supported:
         *  * TypeScript.PullErrorTypeSymbol
         *  * TypeScript.PullTypeAliasSymbol
         *  * TypeScript.PullTypeParameterSymbol
         *  * TypeScript.PullTypeSymbol
         *
         * @param symbol  The TypeScript symbol the type should point to.
         */
        static createType(symbol:TypeScript.PullTypeSymbol):Models.BaseType {
            if (symbol instanceof TypeScript.PullStringConstantTypeSymbol) {
                return TypeHandler.createStringConstantType(symbol.name);
            } else if (symbol instanceof TypeScript.PullPrimitiveTypeSymbol) {
                return TypeHandler.createNamedType(symbol.getDisplayName());
            } else {
                return new Models.LateResolvingType(symbol);
            }
        }


        /**
         * Create a string constant type. If the type has been created before, the existent type will be returned.
         *
         * @param name  The name of the type.
         * @returns     The type instance.
         */
        static createStringConstantType(name:string):Models.StringConstantType {
            if (!TypeHandler.stringConstantTypes[name]) {
                TypeHandler.stringConstantTypes[name] = new Models.StringConstantType(name);
            }

            return TypeHandler.stringConstantTypes[name];
        }


        /**
         * Create a named type. If the type has been created before, the existent type will be returned.
         *
         * @param name  The name of the type.
         * @returns     The type instance.
         */
        static createNamedType(name:string):Models.NamedType {
            if (!TypeHandler.namedTypes[name]) {
                TypeHandler.namedTypes[name] = new Models.NamedType(name);
            }

            return TypeHandler.namedTypes[name];
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(TypeHandler);
}
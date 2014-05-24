module TypeDoc.Factories
{
    /**
     * A factory that converts all instances of LateResolvingType to their renderable equivalents.
     */
    export class TypeHandler
    {
        constructor(private dispatcher:Dispatcher) {
            dispatcher.on('resolveReflection', this.onResolveReflection, this);
        }


        onResolveReflection(reflection:Models.DeclarationReflection) {
            reflection.type          = this.resolveType(reflection.type);
            reflection.inheritedFrom = this.resolveType(reflection.inheritedFrom);
            reflection.overwrites    = this.resolveType(reflection.overwrites);
            reflection.extendedTypes = this.resolveTypes(reflection.extendedTypes);
            reflection.extendedBy    = this.resolveTypes(reflection.extendedBy);
        }


        private resolveTypes(types:Models.BaseType[]):Models.BaseType[] {
            if (!types) return types;
            for (var i = 0, c = types.length; i < c; i++) {
                types[i] = this.resolveType(types[i]);
            }
            return types;
        }


        private resolveType(type:Models.BaseType):Models.BaseType {
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
            var reflection = this.dispatcher.idMap[declID];
            if (reflection) {
                if (reflection.kindOf(Models.Kind.SomeSignature)) {
                    reflection = <Models.DeclarationReflection>reflection.parent;
                }
                return new Models.ReflectionType(reflection, isArray);
            } else {
                if (symbol.fullName() == '') {
                    return new Models.NamedType(symbol.toString());
                } else {
                    return new Models.NamedType(symbol.fullName());
                }
            }
        }
    }


    Dispatcher.FACTORIES.push(TypeHandler);
}
module td
{
    /**
     * A handler that converts all instances of [[LateResolvingType]] to their renderable equivalents.
     */
    export class TypePlugin extends ConverterPlugin
    {
        reflections:DeclarationReflection[] = [];


        /**
         * Create a new TypeHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            super(converter);
            converter.on(Converter.EVENT_RESOLVE, this.onResolve, this);
            converter.on(Converter.EVENT_RESOLVE_END, this.onResolveEnd, this);
        }


        /**
         * Triggered by the dispatcher for each reflection in the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onResolve(event:ResolveEvent) {
            var project = event.getProject();
            var reflection = <DeclarationReflection>event.reflection;

            resolveType(<ReferenceType>reflection.type);
            resolveType(<ReferenceType>reflection.inheritedFrom);
            resolveType(<ReferenceType>reflection.overwrites);
            resolveTypes(reflection.extendedTypes);
            resolveTypes(reflection.extendedBy);

            if (reflection.kindOf(ReflectionKind.ClassOrInterface)) {
                this.postpone(reflection);

                walk(reflection.implementedTypes, (target) => {
                    this.postpone(target);
                    if (!target.implementedBy) target.implementedBy = [];
                    target.implementedBy.push(new ReferenceType(reflection.name, -1, reflection));
                });

                walk(reflection.extendedTypes, (target) => {
                    this.postpone(target);
                    if (!target.extendedBy) target.extendedBy = [];
                    target.extendedBy.push(new ReferenceType(reflection.name, -1, reflection));
                });
            }

            function walk(types:Type[], callback:{(declaration:DeclarationReflection):void}) {
                if (!types) return;
                types.forEach((type:ReferenceType) => {
                    if (!(type instanceof ReferenceType)) return;
                    if (!type.reflection || !(type.reflection instanceof DeclarationReflection)) return;
                    callback(<DeclarationReflection>type.reflection);
                });
            }

            function resolveTypes(types:Type[]) {
                if (!types) return;
                for (var i = 0, c = types.length; i < c; i++) {
                    resolveType(<ReferenceType>types[i]);
                }
            }

            function resolveType(type:Type) {
                if (type instanceof ReferenceType) {
                    var referenceType:ReferenceType = <ReferenceType>type;
                    if (!referenceType.reflection && referenceType.symbolID != -1) {
                        referenceType.reflection = project.reflections[project.symbolMapping[referenceType.symbolID]];
                    }
                    if (referenceType.typeArguments) {
                        referenceType.typeArguments.forEach((typeArgument:Type) => {
                            resolveType(typeArgument);
                        });
                    }
                } else if (type instanceof TupleType) {
                    var tupleType:TupleType = <TupleType>type;
                    for (var index = 0, count = tupleType.elements.length; index < count; index++) {
                        resolveType(tupleType.elements[index]);
                    }
                } else if (type instanceof UnionType) {
                    var unionType:UnionType = <UnionType>type;
                    for (var index = 0, count = unionType.types.length; index < count; index++) {
                        resolveType(unionType.types[index]);
                    }
                }
            }
        }


        private postpone(reflection:DeclarationReflection) {
            if (this.reflections.indexOf(reflection) == -1) {
                this.reflections.push(reflection);
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
        private onResolveEnd(event:ConverterEvent) {
            this.reflections.forEach((reflection) => {
                var root:IDeclarationHierarchy;
                var hierarchy:IDeclarationHierarchy;
                function push(types:Type[]) {
                    var level:IDeclarationHierarchy = {types:types};
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

                push([new ReferenceType(reflection.name, -1, reflection)]);
                hierarchy.isTarget = true;

                if (reflection.extendedBy) {
                    push(reflection.extendedBy);
                }

                reflection.typeHierarchy = root;
            });
        }
    }


    /**
     * Register this handler.
     */
    Converter.registerPlugin('type', TypePlugin);
}
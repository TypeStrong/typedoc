module td.converter
{
    /**
     * A handler that converts all instances of [[LateResolvingType]] to their renderable equivalents.
     */
    export class TypePlugin extends ConverterPlugin
    {
        reflections:models.DeclarationReflection[] = [];


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
         * Triggered when the converter resolves a reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently resolved.
         */
        private onResolve(context:Context, reflection:models.DeclarationReflection) {
            var project = context.project;

            resolveType(reflection, <models.ReferenceType>reflection.type);
            resolveType(reflection, <models.ReferenceType>reflection.inheritedFrom);
            resolveType(reflection, <models.ReferenceType>reflection.overwrites);
            resolveTypes(reflection, reflection.extendedTypes);
            resolveTypes(reflection, reflection.extendedBy);
            resolveTypes(reflection, reflection.implementedTypes);

            if (reflection.decorators) reflection.decorators.forEach((decorator:models.IDecorator) => {
                if (decorator.type) {
                    resolveType(reflection, decorator.type);
                }
            });

            if (reflection.kindOf(models.ReflectionKind.ClassOrInterface)) {
                this.postpone(reflection);

                walk(reflection.implementedTypes, (target) => {
                    this.postpone(target);
                    if (!target.implementedBy) target.implementedBy = [];
                    target.implementedBy.push(new models.ReferenceType(reflection.name, models.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
                });

                walk(reflection.extendedTypes, (target) => {
                    this.postpone(target);
                    if (!target.extendedBy) target.extendedBy = [];
                    target.extendedBy.push(new models.ReferenceType(reflection.name, models.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
                });
            }

            function walk(types:models.Type[], callback:{(declaration:models.DeclarationReflection):void}) {
                if (!types) return;
                types.forEach((type:models.ReferenceType) => {
                    if (!(type instanceof models.ReferenceType)) return;
                    if (!type.reflection || !(type.reflection instanceof models.DeclarationReflection)) return;
                    callback(<models.DeclarationReflection>type.reflection);
                });
            }

            function resolveTypes(reflection:models.Reflection, types:models.Type[]) {
                if (!types) return;
                for (var i = 0, c = types.length; i < c; i++) {
                    resolveType(reflection, <models.ReferenceType>types[i]);
                }
            }

            function resolveType(reflection:models.Reflection, type:models.Type) {
                if (type instanceof models.ReferenceType) {
                    var referenceType:models.ReferenceType = <models.ReferenceType>type;
                    if (referenceType.symbolID == models.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME) {
                        referenceType.reflection = reflection.findReflectionByName(referenceType.name);
                    } else if (!referenceType.reflection && referenceType.symbolID != models.ReferenceType.SYMBOL_ID_RESOLVED) {
                        referenceType.reflection = project.reflections[project.symbolMapping[referenceType.symbolID]];
                    }

                    if (referenceType.typeArguments) {
                        referenceType.typeArguments.forEach((typeArgument:models.Type) => {
                            resolveType(reflection, typeArgument);
                        });
                    }
                } else if (type instanceof models.TupleType) {
                    var tupleType:models.TupleType = <models.TupleType>type;
                    for (var index = 0, count = tupleType.elements.length; index < count; index++) {
                        resolveType(reflection, tupleType.elements[index]);
                    }
                } else if (type instanceof models.UnionType) {
                    var unionType:models.UnionType = <models.UnionType>type;
                    for (var index = 0, count = unionType.types.length; index < count; index++) {
                        resolveType(reflection, unionType.types[index]);
                    }
                }
            }
        }


        private postpone(reflection:models.DeclarationReflection) {
            if (this.reflections.indexOf(reflection) == -1) {
                this.reflections.push(reflection);
            }
        }


        /**
         * Triggered when the converter has finished resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onResolveEnd(context:Context) {
            this.reflections.forEach((reflection) => {
                if (reflection.implementedBy) {
                    reflection.implementedBy.sort((a:models.Type, b:models.Type):number => {
                        if (a['name'] == b['name']) return 0;
                        return a['name'] > b['name'] ? 1 : -1;
                    });
                }

                var root:models.IDeclarationHierarchy;
                var hierarchy:models.IDeclarationHierarchy;
                function push(types:models.Type[]) {
                    var level:models.IDeclarationHierarchy = {types:types};
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

                push([new models.ReferenceType(reflection.name, models.ReferenceType.SYMBOL_ID_RESOLVED, reflection)]);
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
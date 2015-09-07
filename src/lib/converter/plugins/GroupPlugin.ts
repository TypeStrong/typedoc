module td.converter
{
    /**
     * A handler that sorts and groups the found reflections in the resolving phase.
     *
     * The handler sets the ´groups´ property of all reflections.
     */
    export class GroupPlugin extends ConverterPlugin
    {
        /**
         * Define the sort order of reflections.
         */
        static WEIGHTS = [
            models.ReflectionKind.Global,
            models.ReflectionKind.ExternalModule,
            models.ReflectionKind.Module,
            models.ReflectionKind.Enum,
            models.ReflectionKind.EnumMember,
            models.ReflectionKind.Class,
            models.ReflectionKind.Interface,
            models.ReflectionKind.TypeAlias,

            models.ReflectionKind.Constructor,
            models.ReflectionKind.Event,
            models.ReflectionKind.Property,
            models.ReflectionKind.Variable,
            models.ReflectionKind.Function,
            models.ReflectionKind.Accessor,
            models.ReflectionKind.Method,
            models.ReflectionKind.ObjectLiteral,

            models.ReflectionKind.Parameter,
            models.ReflectionKind.TypeParameter,
            models.ReflectionKind.TypeLiteral,
            models.ReflectionKind.CallSignature,
            models.ReflectionKind.ConstructorSignature,
            models.ReflectionKind.IndexSignature,
            models.ReflectionKind.GetSignature,
            models.ReflectionKind.SetSignature,
        ];

        /**
         * Define the singular name of individual reflection kinds.
         */
        static SINGULARS = (function() {
            var singulars = {};
            singulars[models.ReflectionKind.Enum]       = 'Enumeration';
            singulars[models.ReflectionKind.EnumMember] = 'Enumeration member';
            return singulars;
        })();

        /**
         * Define the plural name of individual reflection kinds.
         */
        static PLURALS = (function() {
            var plurals = {};
            plurals[models.ReflectionKind.Class]      = 'Classes';
            plurals[models.ReflectionKind.Property]   = 'Properties';
            plurals[models.ReflectionKind.Enum]       = 'Enumerations';
            plurals[models.ReflectionKind.EnumMember] = 'Enumeration members';
            plurals[models.ReflectionKind.TypeAlias]  = 'Type aliases';
            return plurals;
        })();



        /**
         * Create a new GroupPlugin instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            super(converter);
            converter.on(Converter.EVENT_RESOLVE, this.onResolve, this);
            converter.on(Converter.EVENT_RESOLVE_END, this.onEndResolve, this);
        }


        /**
         * Triggered when the converter resolves a reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently resolved.
         */
        private onResolve(context:Context, reflection:models.Reflection) {
            var reflection = reflection;
            reflection.kindString = GroupPlugin.getKindSingular(reflection.kind);

            if (reflection instanceof models.ContainerReflection) {
                var container = <models.ContainerReflection>reflection;
                if (container.children && container.children.length > 0) {
                    container.children.sort(GroupPlugin.sortCallback);
                    container.groups = GroupPlugin.getReflectionGroups(container.children);
                }
            }
        }


        /**
         * Triggered when the converter has finished resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onEndResolve(context:Context) {
            function walkDirectory(directory) {
                directory.groups = GroupPlugin.getReflectionGroups(directory.getAllReflections());

                for (var key in directory.directories) {
                    if (!directory.directories.hasOwnProperty(key)) continue;
                    walkDirectory(directory.directories[key]);
                }
            }

            var project = context.project;
            if (project.children && project.children.length > 0) {
                project.children.sort(GroupPlugin.sortCallback);
                project.groups = GroupPlugin.getReflectionGroups(project.children);
            }

            walkDirectory(project.directory);
            project.files.forEach((file) => {
                file.groups = GroupPlugin.getReflectionGroups(file.reflections);
            });
        }


        /**
         * Create a grouped representation of the given list of reflections.
         *
         * Reflections are grouped by kind and sorted by weight and name.
         *
         * @param reflections  The reflections that should be grouped.
         * @returns An array containing all children of the given reflection grouped by their kind.
         */
        static getReflectionGroups(reflections:models.DeclarationReflection[]):models.ReflectionGroup[] {
            var groups:models.ReflectionGroup[] = [];
            reflections.forEach((child) => {
                for (var i = 0; i < groups.length; i++) {
                    var group = groups[i];
                    if (group.kind != child.kind) {
                        continue;
                    }

                    group.children.push(child);
                    return;
                }

                var group = new models.ReflectionGroup(GroupPlugin.getKindPlural(child.kind), child.kind);
                group.children.push(child);
                groups.push(group);
            });

            groups.forEach((group) => {
                var someExported = false, allInherited = true, allPrivate = true, allProtected = true, allExternal = true;
                group.children.forEach((child) => {
                    someExported = child.flags.isExported || someExported;
                    allPrivate   = child.flags.isPrivate  && allPrivate;
                    allProtected = (child.flags.isPrivate || child.flags.isProtected) && allProtected;
                    allExternal  = child.flags.isExternal && allExternal;
                    allInherited = child.inheritedFrom    && allInherited;
                });

                group.someChildrenAreExported = someExported;
                group.allChildrenAreInherited = allInherited;
                group.allChildrenArePrivate   = allPrivate;
                group.allChildrenAreProtectedOrPrivate = allProtected;
                group.allChildrenAreExternal  = allExternal;
            });

            return groups;
        }


        /**
         * Transform the internal typescript kind identifier into a human readable version.
         *
         * @param kind  The original typescript kind identifier.
         * @returns A human readable version of the given typescript kind identifier.
         */
        private static getKindString(kind:models.ReflectionKind):string {
            var str = models.ReflectionKind[kind];
            str = str.replace(/(.)([A-Z])/g, (m, a, b) => a + ' ' + b.toLowerCase());
            return str;
        }


        /**
         * Return the singular name of a internal typescript kind identifier.
         *
         * @param kind The original internal typescript kind identifier.
         * @returns The singular name of the given internal typescript kind identifier
         */
        static getKindSingular(kind:models.ReflectionKind):string {
            if (GroupPlugin.SINGULARS[kind]) {
                return GroupPlugin.SINGULARS[kind];
            } else {
                return GroupPlugin.getKindString(kind);
            }
        }


        /**
         * Return the plural name of a internal typescript kind identifier.
         *
         * @param kind The original internal typescript kind identifier.
         * @returns The plural name of the given internal typescript kind identifier
         */
        static getKindPlural(kind:models.ReflectionKind):string {
            if (GroupPlugin.PLURALS[kind]) {
                return GroupPlugin.PLURALS[kind];
            } else {
                return this.getKindString(kind) + 's';
            }
        }


        /**
         * Callback used to sort reflections by weight defined by ´GroupPlugin.WEIGHTS´ and name.
         *
         * @param a The left reflection to sort.
         * @param b The right reflection to sort.
         * @returns The sorting weight.
         */
        static sortCallback(a:models.Reflection, b:models.Reflection):number {
            var aWeight = GroupPlugin.WEIGHTS.indexOf(a.kind);
            var bWeight = GroupPlugin.WEIGHTS.indexOf(b.kind);
            if (aWeight == bWeight) {
                if (a.flags.isStatic && !b.flags.isStatic) return 1;
                if (!a.flags.isStatic && b.flags.isStatic) return -1;
                if (a.name == b.name) return 0;
                return a.name > b.name ? 1 : -1;
            } else return aWeight - bWeight;
        }
    }


    /**
     * Register this handler.
     */
    Converter.registerPlugin('group', GroupPlugin);
}
module TypeDoc.Factories
{
    export class GroupHandler
    {
        static WEIGHTS = [
            TypeScript.PullElementKind.DynamicModule,
            TypeScript.PullElementKind.Container,
            TypeScript.PullElementKind.Enum,
            TypeScript.PullElementKind.Interface,
            TypeScript.PullElementKind.Class,
            TypeScript.PullElementKind.EnumMember,
            TypeScript.PullElementKind.ConstructorMethod,
            TypeScript.PullElementKind.Property,
            TypeScript.PullElementKind.GetAccessor,
            TypeScript.PullElementKind.SetAccessor,
            TypeScript.PullElementKind.Method,
            TypeScript.PullElementKind.Function
        ];

        static SINGULARS = (function() {
            var singulars = {};
            singulars[TypeScript.PullElementKind.Container]  = 'Module';
            singulars[TypeScript.PullElementKind.Enum]       = 'Enumeration';
            singulars[TypeScript.PullElementKind.EnumMember] = 'Enumeration member';
            return singulars;
        })();

        static PLURALS = (function() {
            var plurals = {};
            plurals[TypeScript.PullElementKind.Container]  = 'Modules';
            plurals[TypeScript.PullElementKind.Class]      = 'Classes';
            plurals[TypeScript.PullElementKind.Property]   = 'Properties';
            plurals[TypeScript.PullElementKind.Enum]       = 'Enumerations';
            plurals[TypeScript.PullElementKind.EnumMember] = 'Enumeration members';
            return plurals;
        })();



        constructor(private dispatcher:Dispatcher) {
            dispatcher.on('resolveReflection', this.onResolveReflection, this);
            dispatcher.on('leaveResolve', this.onLeaveResolve, this);
        }


        private onResolveReflection(reflection:Models.DeclarationReflection) {
            if (reflection.kindOf(Models.Kind.SomeSignature)) return;
            if (!reflection.children || reflection.children.length == 0) return;

            reflection.children.sort(GroupHandler.sortCallback);
            reflection.kindString = GroupHandler.getKindSingular(reflection.kind);
            reflection.groups     = GroupHandler.getReflectionGroups(reflection.children);
        }


        onLeaveResolve() {
            function walkDirectory(directory) {
                directory.groups = GroupHandler.getReflectionGroups(directory.getAllReflections());

                for (var key in directory.directories) {
                    if (!directory.directories.hasOwnProperty(key)) continue;
                    walkDirectory(directory.directories[key]);
                }
            }

            walkDirectory(this.dispatcher.project.directory);
            this.dispatcher.project.files.forEach((file) => {
                file.groups = GroupHandler.getReflectionGroups(file.reflections);
            });
        }


        static getReflectionGroups(reflections:Models.DeclarationReflection[]) {
            var groups:Models.ReflectionGroup[] = [];
            reflections.forEach((child) => {
                for (var i = 0; i < groups.length; i++) {
                    var group = groups[i];
                    if (group.kind != child.kind) {
                        continue;
                    }

                    group.children.push(child);
                    return;
                }

                var group = new Models.ReflectionGroup(GroupHandler.getKindPlural(child.kind), child.kind);
                group.children.push(child);
                groups.push(group);
            });

            return groups;
        }


        static getKindString(kind:TypeScript.PullElementKind) {
            var str = TypeScript.PullElementKind[kind];
            str = str.replace(/(.)([A-Z])/g, (m,a,b) => a + ' ' + b.toLowerCase());
            return str;
        }


        static getKindSingular(kind:TypeScript.PullElementKind):string {
            if (GroupHandler.SINGULARS[kind]) {
                return GroupHandler.SINGULARS[kind];
            } else {
                return GroupHandler.getKindString(kind);
            }
        }


        static getKindPlural(kind:TypeScript.PullElementKind):string {
            if (GroupHandler.PLURALS[kind]) {
                return GroupHandler.PLURALS[kind];
            } else {
                return this.getKindString(kind) + 's';
            }
        }


        static sortCallback(a:Models.DeclarationReflection, b:Models.DeclarationReflection):number {
            var aWeight = GroupHandler.WEIGHTS.indexOf(a.kind);
            var bWeight = GroupHandler.WEIGHTS.indexOf(b.kind);
            if (aWeight == bWeight) {
                if (a.name == b.name) return 0;
                return a.name > b.name ? 1 : -1;
            } else return aWeight - bWeight;
        }
    }


    Dispatcher.FACTORIES.push(GroupHandler);
}
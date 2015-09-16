import {Reflection, ReflectionKind, ContainerReflection, DeclarationReflection} from "../../models/reflections/index";
import {ReflectionGroup} from "../../models/ReflectionGroup";
import {SourceDirectory} from "../../models/sources/directory";
import {Component, ConverterComponent} from "../components";
import {Converter} from "../converter";
import {Context} from "../context";


/**
 * A handler that sorts and groups the found reflections in the resolving phase.
 *
 * The handler sets the ´groups´ property of all reflections.
 */
@Component({name:'group'})
export class GroupPlugin extends ConverterComponent
{
    /**
     * Define the sort order of reflections.
     */
    static WEIGHTS = [
        ReflectionKind.Global,
        ReflectionKind.ExternalModule,
        ReflectionKind.Module,
        ReflectionKind.Enum,
        ReflectionKind.EnumMember,
        ReflectionKind.Class,
        ReflectionKind.Interface,
        ReflectionKind.TypeAlias,

        ReflectionKind.Constructor,
        ReflectionKind.Event,
        ReflectionKind.Property,
        ReflectionKind.Variable,
        ReflectionKind.Function,
        ReflectionKind.Accessor,
        ReflectionKind.Method,
        ReflectionKind.ObjectLiteral,

        ReflectionKind.Parameter,
        ReflectionKind.TypeParameter,
        ReflectionKind.TypeLiteral,
        ReflectionKind.CallSignature,
        ReflectionKind.ConstructorSignature,
        ReflectionKind.IndexSignature,
        ReflectionKind.GetSignature,
        ReflectionKind.SetSignature,
    ];

    /**
     * Define the singular name of individual reflection kinds.
     */
    static SINGULARS = (function() {
        var singulars = {};
        singulars[ReflectionKind.Enum]       = 'Enumeration';
        singulars[ReflectionKind.EnumMember] = 'Enumeration member';
        return singulars;
    })();

    /**
     * Define the plural name of individual reflection kinds.
     */
    static PLURALS = (function() {
        var plurals = {};
        plurals[ReflectionKind.Class]      = 'Classes';
        plurals[ReflectionKind.Property]   = 'Properties';
        plurals[ReflectionKind.Enum]       = 'Enumerations';
        plurals[ReflectionKind.EnumMember] = 'Enumeration members';
        plurals[ReflectionKind.TypeAlias]  = 'Type aliases';
        return plurals;
    })();



    /**
     * Create a new GroupPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_RESOLVE]:     this.onResolve,
            [Converter.EVENT_RESOLVE_END]: this.onEndResolve
        });
    }


    /**
     * Triggered when the converter resolves a reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently resolved.
     */
    private onResolve(context:Context, reflection:Reflection) {
        var reflection = reflection;
        reflection.kindString = GroupPlugin.getKindSingular(reflection.kind);

        if (reflection instanceof ContainerReflection) {
            var container = <ContainerReflection>reflection;
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
        function walkDirectory(directory:SourceDirectory) {
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
    static getReflectionGroups(reflections:Reflection[]):ReflectionGroup[] {
        var groups:ReflectionGroup[] = [];
        reflections.forEach((child) => {
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                if (group.kind != child.kind) {
                    continue;
                }

                group.children.push(child);
                return;
            }

            var group = new ReflectionGroup(GroupPlugin.getKindPlural(child.kind), child.kind);
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

                if (child instanceof DeclarationReflection) {
                    allInherited = child.inheritedFrom && allInherited;
                } else {
                    allInherited = false;
                }
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
    private static getKindString(kind:ReflectionKind):string {
        var str = ReflectionKind[kind];
        str = str.replace(/(.)([A-Z])/g, (m, a, b) => a + ' ' + b.toLowerCase());
        return str;
    }


    /**
     * Return the singular name of a internal typescript kind identifier.
     *
     * @param kind The original internal typescript kind identifier.
     * @returns The singular name of the given internal typescript kind identifier
     */
    static getKindSingular(kind:ReflectionKind):string {
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
    static getKindPlural(kind:ReflectionKind):string {
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
    static sortCallback(a:Reflection, b:Reflection):number {
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

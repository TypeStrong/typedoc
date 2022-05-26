import {
    Reflection,
    ReflectionKind,
    ContainerReflection,
    DeclarationReflection,
} from "../../models/reflections/index";
import { ReflectionGroup } from "../../models/ReflectionGroup";
import type { SourceDirectory } from "../../models/sources/directory";
import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import { sortReflections, SortStrategy } from "../../utils/sort";
import { BindOption } from "../../utils";

/**
 * A handler that sorts and groups the found reflections in the resolving phase.
 *
 * The handler sets the ´groups´ property of all reflections.
 */
@Component({ name: "group" })
export class GroupPlugin extends ConverterComponent {
    /**
     * Define the singular name of individual reflection kinds.
     */
    static SINGULARS = {
        [ReflectionKind.Enum]: "Enumeration",
        [ReflectionKind.EnumMember]: "Enumeration Member",
    };

    /**
     * Define the plural name of individual reflection kinds.
     */
    static PLURALS = {
        [ReflectionKind.Class]: "Classes",
        [ReflectionKind.Property]: "Properties",
        [ReflectionKind.Enum]: "Enumerations",
        [ReflectionKind.EnumMember]: "Enumeration Members",
        [ReflectionKind.TypeAlias]: "Type Aliases",
    };

    /** @internal */
    @BindOption("sort")
    sortStrategies!: SortStrategy[];

    /**
     * Create a new GroupPlugin instance.
     */
    override initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_RESOLVE]: this.onResolve,
            [Converter.EVENT_RESOLVE_END]: this.onEndResolve,
        });
    }

    /**
     * Triggered when the converter resolves a reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently resolved.
     */
    private onResolve(_context: Context, reflection: Reflection) {
        reflection.kindString = GroupPlugin.getKindSingular(reflection.kind);

        if (reflection instanceof ContainerReflection) {
            this.group(reflection);
        }
    }

    /**
     * Triggered when the converter has finished resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onEndResolve(context: Context) {
        function walkDirectory(directory: SourceDirectory) {
            directory.groups = GroupPlugin.getReflectionGroups(
                directory.getAllReflections()
            );

            for (const dir of Object.values(directory.directories)) {
                walkDirectory(dir);
            }
        }

        const project = context.project;
        this.group(project);

        walkDirectory(project.directory);
        project.files.forEach((file) => {
            file.groups = GroupPlugin.getReflectionGroups(file.reflections);
        });
    }

    private group(reflection: ContainerReflection) {
        if (
            reflection.children &&
            reflection.children.length > 0 &&
            !reflection.groups
        ) {
            sortReflections(reflection.children, this.sortStrategies);
            reflection.groups = GroupPlugin.getReflectionGroups(
                reflection.children
            );
        }
    }

    /**
     * Create a grouped representation of the given list of reflections.
     *
     * Reflections are grouped by kind and sorted by weight and name.
     *
     * @param reflections  The reflections that should be grouped.
     * @returns An array containing all children of the given reflection grouped by their kind.
     */
    static getReflectionGroups(
        reflections: DeclarationReflection[]
    ): ReflectionGroup[] {
        const groups: ReflectionGroup[] = [];
        reflections.forEach((child) => {
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                if (group.kind !== child.kind) {
                    continue;
                }

                group.children.push(child);
                return;
            }

            const group = new ReflectionGroup(
                GroupPlugin.getKindPlural(child.kind),
                child.kind
            );
            group.children.push(child);
            groups.push(group);
        });

        groups.forEach((group) => {
            let allInherited = true;
            let allPrivate = true;
            let allProtected = true;
            let allExternal = true;

            group.children.forEach((child) => {
                allPrivate = child.flags.isPrivate && allPrivate;
                allProtected =
                    (child.flags.isPrivate || child.flags.isProtected) &&
                    allProtected;
                allExternal = child.flags.isExternal && allExternal;

                if (child instanceof DeclarationReflection) {
                    allInherited = !!child.inheritedFrom && allInherited;
                } else {
                    allInherited = false;
                }
            });

            group.allChildrenAreInherited = allInherited;
            group.allChildrenArePrivate = allPrivate;
            group.allChildrenAreProtectedOrPrivate = allProtected;
            group.allChildrenAreExternal = allExternal;
        });

        return groups;
    }

    /**
     * Transform the internal typescript kind identifier into a human readable version.
     *
     * @param kind  The original typescript kind identifier.
     * @returns A human readable version of the given typescript kind identifier.
     */
    private static getKindString(kind: ReflectionKind): string {
        let str = ReflectionKind[kind];
        str = str.replace(
            /(.)([A-Z])/g,
            (_m, a, b) => a + " " + b.toLowerCase()
        );
        return str;
    }

    /**
     * Return the singular name of a internal typescript kind identifier.
     *
     * @param kind The original internal typescript kind identifier.
     * @returns The singular name of the given internal typescript kind identifier
     */
    static getKindSingular(kind: ReflectionKind): string {
        if (kind in GroupPlugin.SINGULARS) {
            return GroupPlugin.SINGULARS[
                kind as keyof typeof GroupPlugin.SINGULARS
            ];
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
    static getKindPlural(kind: ReflectionKind): string {
        if (kind in GroupPlugin.PLURALS) {
            return GroupPlugin.PLURALS[
                kind as keyof typeof GroupPlugin.PLURALS
            ];
        } else {
            return this.getKindString(kind) + "s";
        }
    }
}

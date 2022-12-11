import {
    Reflection,
    ReflectionKind,
    ContainerReflection,
    DeclarationReflection,
} from "../../models/reflections/index";
import { ReflectionGroup } from "../../models/ReflectionGroup";
import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import { getSortFunction } from "../../utils/sort";
import { BindOption, removeIf } from "../../utils";
import { Comment } from "../../models";

/**
 * A handler that sorts and groups the found reflections in the resolving phase.
 *
 * The handler sets the `groups` property of all container reflections.
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

    sortFunction!: (reflections: DeclarationReflection[]) => void;

    @BindOption("searchGroupBoosts")
    boosts!: Record<string, number>;

    usedBoosts = new Set<string>();

    /**
     * Create a new GroupPlugin instance.
     */
    override initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_RESOLVE_BEGIN]: () => {
                this.sortFunction = getSortFunction(this.application.options);
            },
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
        this.group(context.project);

        const unusedBoosts = new Set(Object.keys(this.boosts));
        for (const boost of this.usedBoosts) {
            unusedBoosts.delete(boost);
        }
        this.usedBoosts.clear();

        if (
            unusedBoosts.size &&
            this.application.options.isSet("searchGroupBoosts")
        ) {
            context.logger.warn(
                `Not all groups specified in searchGroupBoosts were used in the documentation.` +
                    ` The unused groups were:\n\t${Array.from(
                        unusedBoosts
                    ).join("\n\t")}`
            );
        }
    }

    private group(reflection: ContainerReflection) {
        if (
            reflection.children &&
            reflection.children.length > 0 &&
            !reflection.groups
        ) {
            this.sortFunction(reflection.children);
            reflection.groups = this.getReflectionGroups(reflection.children);
        }
    }

    /**
     * Extracts the groups for a given reflection.
     *
     * @privateRemarks
     * If you change this, also update getCategories in CategoryPlugin accordingly.
     */
    getGroups(reflection: DeclarationReflection) {
        const groups = new Set<string>();
        function extractGroupTags(comment: Comment | undefined) {
            if (!comment) return;
            removeIf(comment.blockTags, (tag) => {
                if (tag.tag === "@group") {
                    groups.add(Comment.combineDisplayParts(tag.content).trim());

                    return true;
                }
                return false;
            });
        }

        extractGroupTags(reflection.comment);
        for (const sig of reflection.getNonIndexSignatures()) {
            extractGroupTags(sig.comment);
        }

        if (reflection.type?.type === "reflection") {
            extractGroupTags(reflection.type.declaration.comment);
            for (const sig of reflection.type.declaration.getNonIndexSignatures()) {
                extractGroupTags(sig.comment);
            }
        }

        groups.delete("");
        if (groups.size === 0) {
            groups.add(GroupPlugin.getKindPlural(reflection.kind));
        }

        for (const group of groups) {
            if (group in this.boosts) {
                this.usedBoosts.add(group);
                reflection.relevanceBoost =
                    (reflection.relevanceBoost ?? 1) * this.boosts[group];
            }
        }

        return groups;
    }

    /**
     * Create a grouped representation of the given list of reflections.
     *
     * Reflections are grouped by kind and sorted by weight and name.
     *
     * @param reflections  The reflections that should be grouped.
     * @returns An array containing all children of the given reflection grouped by their kind.
     */
    getReflectionGroups(
        reflections: DeclarationReflection[]
    ): ReflectionGroup[] {
        const groups = new Map<string, ReflectionGroup>();

        reflections.forEach((child) => {
            for (const name of this.getGroups(child)) {
                let group = groups.get(name);
                if (!group) {
                    group = new ReflectionGroup(name);
                    groups.set(name, group);
                }

                group.children.push(child);
            }
        });

        return Array.from(groups.values());
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

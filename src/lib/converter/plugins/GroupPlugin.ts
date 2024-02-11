import {
    ReflectionKind,
    ContainerReflection,
    DeclarationReflection,
} from "../../models/reflections/index";
import { ReflectionGroup } from "../../models/ReflectionGroup";
import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import { getSortFunction } from "../../utils/sort";
import { Option, removeIf } from "../../utils";
import { Comment } from "../../models";

/**
 * A handler that sorts and groups the found reflections in the resolving phase.
 *
 * The handler sets the `groups` property of all container reflections.
 */
@Component({ name: "group" })
export class GroupPlugin extends ConverterComponent {
    sortFunction!: (reflections: DeclarationReflection[]) => void;

    @Option("searchGroupBoosts")
    accessor boosts!: Record<string, number>;

    @Option("groupOrder")
    accessor groupOrder!: string[];

    @Option("sortEntryPoints")
    accessor sortEntryPoints!: boolean;

    usedBoosts = new Set<string>();

    static WEIGHTS: string[] = [];

    /**
     * Create a new GroupPlugin instance.
     */
    override initialize() {
        this.listenTo(
            this.owner,
            {
                [Converter.EVENT_RESOLVE_BEGIN]: () => {
                    this.sortFunction = getSortFunction(
                        this.application.options,
                    );
                    GroupPlugin.WEIGHTS = this.groupOrder;
                },
                [Converter.EVENT_RESOLVE_END]: this.onEndResolve,
            },
            undefined,
            -100,
        );
    }

    /**
     * Triggered when the converter has finished resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onEndResolve(context: Context) {
        this.group(context.project);

        for (const id in context.project.reflections) {
            const reflection = context.project.reflections[id];
            if (reflection instanceof ContainerReflection) {
                this.group(reflection);
            }
        }

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
                context.i18n.not_all_search_group_boosts_used_0(
                    Array.from(unusedBoosts).join("\n\t"),
                ),
            );
        }
    }

    private group(reflection: ContainerReflection) {
        if (
            reflection.children &&
            reflection.children.length > 0 &&
            !reflection.groups
        ) {
            if (
                this.sortEntryPoints ||
                !reflection.children.some((c) =>
                    c.kindOf(ReflectionKind.Module),
                )
            ) {
                this.sortFunction(reflection.children);
            }
            reflection.groups = this.getReflectionGroups(reflection.children);
        }
    }

    /**
     * Extracts the groups for a given reflection.
     *
     * @privateRemarks
     * If you change this, also update extractCategories in CategoryPlugin accordingly.
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
            groups.add(ReflectionKind.pluralString(reflection.kind));
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
        reflections: DeclarationReflection[],
    ): ReflectionGroup[] {
        const groups = new Map<string, ReflectionGroup>();

        reflections.forEach((child) => {
            for (const name of this.getGroups(child)) {
                let group = groups.get(name);
                if (!group) {
                    group = new ReflectionGroup(name, child);
                    groups.set(name, group);
                }

                group.children.push(child);
            }
        });

        return Array.from(groups.values()).sort(GroupPlugin.sortGroupCallback);
    }

    /**
     * Callback used to sort groups by name.
     */
    static sortGroupCallback(a: ReflectionGroup, b: ReflectionGroup): number {
        let aWeight = GroupPlugin.WEIGHTS.indexOf(a.title);
        let bWeight = GroupPlugin.WEIGHTS.indexOf(b.title);
        if (aWeight === -1 || bWeight === -1) {
            let asteriskIndex = GroupPlugin.WEIGHTS.indexOf("*");
            if (asteriskIndex === -1) {
                asteriskIndex = GroupPlugin.WEIGHTS.length;
            }
            if (aWeight === -1) {
                aWeight = asteriskIndex;
            }
            if (bWeight === -1) {
                bWeight = asteriskIndex;
            }
        }
        if (aWeight === bWeight) {
            return a.title > b.title ? 1 : -1;
        }
        return aWeight - bWeight;
    }
}

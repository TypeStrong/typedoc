import {
    ReflectionKind,
    ContainerReflection,
    type DeclarationReflection,
    type DocumentReflection,
} from "../../models/reflections/index";
import { ReflectionGroup } from "../../models/ReflectionGroup";
import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import { getSortFunction } from "../../utils/sort";
import { Option, removeIf } from "../../utils";
import { Comment } from "../../models";

// Same as the defaultKindSortOrder in sort.ts
const defaultGroupOrder = [
    ReflectionKind.Document,
    ReflectionKind.Reference,
    // project is never a child so never added to a group
    ReflectionKind.Module,
    ReflectionKind.Namespace,
    ReflectionKind.Enum,
    ReflectionKind.EnumMember,
    ReflectionKind.Class,
    ReflectionKind.Interface,
    ReflectionKind.TypeAlias,

    ReflectionKind.Constructor,
    ReflectionKind.Property,
    ReflectionKind.Variable,
    ReflectionKind.Function,
    ReflectionKind.Accessor,
    ReflectionKind.Method,

    // others are never added to groups
];

/**
 * A handler that sorts and groups the found reflections in the resolving phase.
 *
 * The handler sets the `groups` property of all container reflections.
 */
@Component({ name: "group" })
export class GroupPlugin extends ConverterComponent {
    sortFunction!: (
        reflections: Array<DeclarationReflection | DocumentReflection>,
    ) => void;

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
        this.owner.on(
            Converter.EVENT_RESOLVE_BEGIN,
            () => {
                this.sortFunction = getSortFunction(this.application.options);
                GroupPlugin.WEIGHTS = this.groupOrder;
                if (GroupPlugin.WEIGHTS.length === 0) {
                    GroupPlugin.WEIGHTS = defaultGroupOrder.map((kind) =>
                        this.application.internationalization.kindPluralString(
                            kind,
                        ),
                    );
                }
            },
            -100,
        );
        this.owner.on(
            Converter.EVENT_RESOLVE_END,
            this.onEndResolve.bind(this),
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
        if (reflection.childrenIncludingDocuments && !reflection.groups) {
            if (reflection.children) {
                if (
                    this.sortEntryPoints ||
                    !reflection.children.some((c) =>
                        c.kindOf(ReflectionKind.Module),
                    )
                ) {
                    this.sortFunction(reflection.children);
                    this.sortFunction(reflection.documents || []);
                    this.sortFunction(reflection.childrenIncludingDocuments);
                }
            } else if (reflection.documents) {
                this.sortFunction(reflection.documents);
                this.sortFunction(reflection.childrenIncludingDocuments);
            }

            reflection.groups = this.getReflectionGroups(
                reflection,
                reflection.childrenIncludingDocuments,
            );
        }
    }

    /**
     * Extracts the groups for a given reflection.
     *
     * @privateRemarks
     * If you change this, also update extractCategories in CategoryPlugin accordingly.
     */
    getGroups(reflection: DeclarationReflection | DocumentReflection) {
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

        if (reflection.isDeclaration()) {
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
        }

        if (reflection.isDocument() && "group" in reflection.frontmatter) {
            groups.add(String(reflection.frontmatter["group"]));
            delete reflection.frontmatter["group"];
        }

        groups.delete("");
        if (groups.size === 0) {
            groups.add(
                this.application.internationalization.kindPluralString(
                    reflection.kind,
                ),
            );
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
        parent: ContainerReflection,
        reflections: Array<DeclarationReflection | DocumentReflection>,
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

        if (parent.comment) {
            removeIf(parent.comment.blockTags, (tag) => {
                if (tag.tag === "@groupDescription") {
                    const { header, body } = Comment.splitPartsToHeaderAndBody(
                        tag.content,
                    );
                    const cat = groups.get(header);
                    if (cat) {
                        cat.description = body;
                    } else {
                        this.application.logger.warn(
                            this.application.i18n.comment_for_0_includes_groupDescription_for_1_but_no_child_in_group(
                                parent.getFriendlyFullName(),
                                header,
                            ),
                        );
                    }

                    return true;
                }
                return false;
            });
        }

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

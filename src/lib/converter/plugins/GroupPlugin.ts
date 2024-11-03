import {
    ReflectionKind,
    ContainerReflection,
    type DeclarationReflection,
    type DocumentReflection,
    ReferenceReflection,
    type ProjectReflection,
} from "../../models/reflections/index.js";
import { ReflectionGroup } from "../../models/ReflectionGroup.js";
import { ConverterComponent } from "../components.js";
import type { Context } from "../context.js";
import { getSortFunction } from "../../utils/sort.js";
import { Option } from "../../utils/index.js";
import { Comment } from "../../models/index.js";
import { ConverterEvents } from "../converter-events.js";
import type { Converter } from "../converter.js";
import { ApplicationEvents } from "../../application-events.js";
import assert from "assert";
import type { Internationalization } from "../../internationalization/index.js";

// Same as the defaultKindSortOrder in sort.ts
const defaultGroupOrder = [
    ReflectionKind.Document,
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

    ReflectionKind.Reference,
    // others are never added to groups
];

/**
 * A handler that sorts and groups the found reflections in the resolving phase.
 *
 * The handler sets the `groups` property of all container reflections.
 */
export class GroupPlugin extends ConverterComponent {
    sortFunction!: (
        reflections: Array<DeclarationReflection | DocumentReflection>,
    ) => void;

    @Option("groupOrder")
    accessor groupOrder!: string[];

    @Option("sortEntryPoints")
    accessor sortEntryPoints!: boolean;

    @Option("groupReferencesByType")
    accessor groupReferencesByType!: boolean;

    static WEIGHTS: string[] = [];

    constructor(owner: Converter) {
        super(owner);
        this.owner.on(
            ConverterEvents.RESOLVE_END,
            this.onEndResolve.bind(this),
            -100,
        );
        this.application.on(
            ApplicationEvents.REVIVE,
            this.onRevive.bind(this),
            -100,
        );
    }

    /**
     * Triggered when the converter has finished resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onEndResolve(context: Context) {
        this.setup();
        this.group(context.project);

        for (const id in context.project.reflections) {
            const reflection = context.project.reflections[id];
            if (reflection instanceof ContainerReflection) {
                this.group(reflection);
            }
        }
    }

    private onRevive(project: ProjectReflection) {
        this.setup();
        this.group(project);
        for (const refl of project.getReflectionsByKind(
            ReflectionKind.SomeModule,
        )) {
            assert(refl.isDeclaration());
            this.group(refl);
        }
    }

    private setup() {
        this.sortFunction = getSortFunction(this.application.options);
        GroupPlugin.WEIGHTS = this.groupOrder;
        if (GroupPlugin.WEIGHTS.length === 0) {
            GroupPlugin.WEIGHTS = defaultGroupOrder.map((kind) =>
                this.application.internationalization.kindPluralString(kind),
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
        return GroupPlugin.getGroups(
            reflection,
            this.groupReferencesByType,
            this.application.internationalization,
        );
    }

    static getGroups(
        reflection: DeclarationReflection | DocumentReflection,
        groupReferencesByType: boolean,
        internationalization: Internationalization,
    ) {
        const groups = new Set<string>();
        function extractGroupTags(comment: Comment | undefined) {
            if (!comment) return;
            for (const tag of comment.blockTags) {
                if (tag.tag === "@group") {
                    groups.add(Comment.combineDisplayParts(tag.content).trim());
                }
            }
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
        }

        groups.delete("");
        if (groups.size === 0) {
            if (
                reflection instanceof ReferenceReflection &&
                groupReferencesByType
            ) {
                groups.add(
                    internationalization.kindPluralString(
                        reflection.getTargetReflectionDeep().kind,
                    ),
                );
            } else {
                groups.add(
                    internationalization.kindPluralString(reflection.kind),
                );
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
            for (const tag of parent.comment.blockTags) {
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
                }
            }
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

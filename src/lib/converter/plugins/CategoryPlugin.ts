import assert from "assert";
import { ApplicationEvents } from "../../application-events.js";
import {
    Comment,
    ContainerReflection,
    ReflectionCategory,
    ReflectionKind,
    type DeclarationReflection,
    type DocumentReflection,
    type ProjectReflection,
} from "../../models/index.js";
import { Option, getSortFunction } from "../../utils/index.js";
import { ConverterComponent } from "../components.js";
import type { Context } from "../context.js";
import { ConverterEvents } from "../converter-events.js";
import type { Converter } from "../converter.js";

/**
 * A handler that sorts and categorizes the found reflections in the resolving phase.
 *
 * The handler sets the ´category´ property of all reflections.
 */
export class CategoryPlugin extends ConverterComponent {
    sortFunction!: (
        reflections: Array<DeclarationReflection | DocumentReflection>,
    ) => void;

    @Option("defaultCategory")
    accessor defaultCategory!: string;

    @Option("categoryOrder")
    accessor categoryOrder!: string[];

    @Option("categorizeByGroup")
    accessor categorizeByGroup!: boolean;

    // For use in static methods
    static defaultCategory = "Other";
    static WEIGHTS: string[] = [];

    constructor(owner: Converter) {
        super(owner);
        this.owner.on(
            ConverterEvents.RESOLVE_END,
            this.onEndResolve.bind(this),
            -200,
        );
        this.application.on(
            ApplicationEvents.REVIVE,
            this.onRevive.bind(this),
            -200,
        );
    }

    private onRevive(project: ProjectReflection) {
        this.setup();

        this.categorize(project);
        for (const refl of project.getReflectionsByKind(
            ReflectionKind.SomeModule,
        )) {
            assert(refl.isDeclaration());
            this.categorize(refl);
        }
    }

    /**
     * Triggered when the converter begins converting a project.
     */
    private setup() {
        this.sortFunction = getSortFunction(this.application.options);

        // Set up static properties
        if (this.defaultCategory) {
            CategoryPlugin.defaultCategory = this.defaultCategory;
        }
        CategoryPlugin.WEIGHTS = this.categoryOrder;
    }

    /**
     * Triggered when the converter has finished resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onEndResolve(context: Context) {
        this.setup();

        const project = context.project;
        this.categorize(project);

        for (const id in project.reflections) {
            const reflection = project.reflections[id];
            if (reflection instanceof ContainerReflection) {
                this.categorize(reflection);
            }
        }
    }

    private categorize(obj: ContainerReflection) {
        if (this.categorizeByGroup) {
            this.groupCategorize(obj);
        } else {
            this.lumpCategorize(obj);
        }
    }

    private groupCategorize(obj: ContainerReflection) {
        if (!obj.groups || obj.groups.length === 0) {
            return;
        }
        obj.groups.forEach((group) => {
            if (group.categories) return;

            group.categories = this.getReflectionCategories(
                obj,
                group.children,
            );
            if (group.categories.length > 1) {
                group.categories.sort(CategoryPlugin.sortCatCallback);
            } else if (
                group.categories.length === 1 &&
                group.categories[0].title === CategoryPlugin.defaultCategory
            ) {
                // no categories if everything is uncategorized
                group.categories = undefined;
            }
        });
    }

    private lumpCategorize(obj: ContainerReflection) {
        if (!obj.childrenIncludingDocuments || obj.categories) {
            return;
        }
        obj.categories = this.getReflectionCategories(
            obj,
            obj.childrenIncludingDocuments,
        );
        if (obj.categories.length > 1) {
            obj.categories.sort(CategoryPlugin.sortCatCallback);
        } else if (
            obj.categories.length === 1 &&
            obj.categories[0].title === CategoryPlugin.defaultCategory
        ) {
            // no categories if everything is uncategorized
            obj.categories = undefined;
        }
    }

    /**
     * Create a categorized representation of the given list of reflections.
     *
     * @param reflections  The reflections that should be categorized.
     * @returns An array containing all children of the given reflection categorized
     */
    private getReflectionCategories(
        parent: ContainerReflection,
        reflections: Array<DeclarationReflection | DocumentReflection>,
    ): ReflectionCategory[] {
        const categories = new Map<string, ReflectionCategory>();

        for (const child of reflections) {
            const childCategories = CategoryPlugin.getCategories(child);
            if (childCategories.size === 0) {
                childCategories.add(CategoryPlugin.defaultCategory);
            }

            for (const childCat of childCategories) {
                const category = categories.get(childCat);

                if (category) {
                    category.children.push(child);
                } else {
                    const cat = new ReflectionCategory(childCat);
                    cat.children.push(child);
                    categories.set(childCat, cat);
                }
            }
        }

        if (parent.comment) {
            for (const tag of parent.comment.blockTags) {
                if (tag.tag === "@categoryDescription") {
                    const { header, body } = Comment.splitPartsToHeaderAndBody(
                        tag.content,
                    );
                    const cat = categories.get(header);
                    if (cat) {
                        cat.description = body;
                    } else {
                        this.application.logger.warn(
                            this.application.i18n.comment_for_0_includes_categoryDescription_for_1_but_no_child_in_group(
                                parent.getFriendlyFullName(),
                                header,
                            ),
                        );
                    }
                }
            }
        }

        for (const cat of categories.values()) {
            this.sortFunction(cat.children);
        }

        return Array.from(categories.values());
    }

    /**
     * Callback used to sort categories by name.
     *
     * @param a The left reflection to sort.
     * @param b The right reflection to sort.
     * @returns The sorting weight.
     */
    private static sortCatCallback(
        a: ReflectionCategory,
        b: ReflectionCategory,
    ): number {
        let aWeight = CategoryPlugin.WEIGHTS.indexOf(a.title);
        let bWeight = CategoryPlugin.WEIGHTS.indexOf(b.title);
        if (aWeight === -1 || bWeight === -1) {
            let asteriskIndex = CategoryPlugin.WEIGHTS.indexOf("*");
            if (asteriskIndex === -1) {
                asteriskIndex = CategoryPlugin.WEIGHTS.length;
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

    static getCategories(
        reflection: DeclarationReflection | DocumentReflection,
    ) {
        const categories = new Set<string>();
        function discoverCategories(comment: Comment | undefined) {
            if (!comment) return;
            for (const tag of comment.blockTags) {
                if (tag.tag === "@category") {
                    categories.add(
                        Comment.combineDisplayParts(tag.content).trim(),
                    );
                }
            }
        }

        discoverCategories(reflection.comment);
        if (reflection.isDeclaration()) {
            for (const sig of reflection.getNonIndexSignatures()) {
                discoverCategories(sig.comment);
            }

            if (reflection.type?.type === "reflection") {
                discoverCategories(reflection.type.declaration.comment);
                for (const sig of reflection.type.declaration.getNonIndexSignatures()) {
                    discoverCategories(sig.comment);
                }
            }
        }

        if (reflection.isDocument() && "category" in reflection.frontmatter) {
            categories.add(String(reflection.frontmatter["category"]));
        }

        categories.delete("");

        return categories;
    }
}

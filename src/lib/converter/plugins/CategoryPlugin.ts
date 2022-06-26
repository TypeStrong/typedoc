import {
    Reflection,
    ContainerReflection,
    DeclarationReflection,
    Comment,
} from "../../models";
import { ReflectionCategory } from "../../models";
import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import { BindOption, removeIf } from "../../utils";

/**
 * A handler that sorts and categorizes the found reflections in the resolving phase.
 *
 * The handler sets the ´category´ property of all reflections.
 */
@Component({ name: "category" })
export class CategoryPlugin extends ConverterComponent {
    @BindOption("defaultCategory")
    defaultCategory!: string;

    @BindOption("categoryOrder")
    categoryOrder!: string[];

    @BindOption("categorizeByGroup")
    categorizeByGroup!: boolean;

    @BindOption("searchCategoryBoosts")
    boosts!: Record<string, number>;

    usedBoosts = new Set<string>();

    // For use in static methods
    static defaultCategory = "Other";
    static WEIGHTS: string[] = [];

    /**
     * Create a new CategoryPlugin instance.
     */
    override initialize() {
        this.listenTo(
            this.owner,
            {
                [Converter.EVENT_BEGIN]: this.onBegin,
                [Converter.EVENT_RESOLVE]: this.onResolve,
                [Converter.EVENT_RESOLVE_END]: this.onEndResolve,
            },
            undefined,
            -200
        );
    }

    /**
     * Triggered when the converter begins converting a project.
     */
    private onBegin(_context: Context) {
        // Set up static properties
        if (this.defaultCategory) {
            CategoryPlugin.defaultCategory = this.defaultCategory;
        }
        if (this.categoryOrder) {
            CategoryPlugin.WEIGHTS = this.categoryOrder;
        }
    }

    /**
     * Triggered when the converter resolves a reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently resolved.
     */
    private onResolve(_context: Context, reflection: Reflection) {
        if (reflection instanceof ContainerReflection) {
            this.categorize(reflection);
        }
    }

    /**
     * Triggered when the converter has finished resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onEndResolve(context: Context) {
        const project = context.project;
        this.categorize(project);

        const unusedBoosts = new Set(Object.keys(this.boosts));
        for (const boost of this.usedBoosts) {
            unusedBoosts.delete(boost);
        }
        this.usedBoosts.clear();

        if (unusedBoosts.size) {
            context.logger.warn(
                `Not all categories specified in searchCategoryBoosts were used in the documentation.` +
                    ` The unused categories were:\n\t${Array.from(
                        unusedBoosts
                    ).join("\n\t")}`
            );
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

            group.categories = this.getReflectionCategories(group.children);
            if (group.categories && group.categories.length > 1) {
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
        if (!obj.children || obj.children.length === 0 || obj.categories) {
            return;
        }
        obj.categories = this.getReflectionCategories(obj.children);
        if (obj.categories && obj.categories.length > 1) {
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
     * @param categorySearchBoosts A user-supplied map of category titles, for computing a
     *   relevance boost to be used when searching
     * @returns An array containing all children of the given reflection categorized
     */
    getReflectionCategories(
        reflections: DeclarationReflection[]
    ): ReflectionCategory[] {
        const categories: ReflectionCategory[] = [];
        let defaultCat: ReflectionCategory | undefined;
        reflections.forEach((child) => {
            const childCategories = this.getCategories(child);
            if (childCategories.size === 0) {
                if (!defaultCat) {
                    defaultCat = categories.find(
                        (category) =>
                            category.title === CategoryPlugin.defaultCategory
                    );
                    if (!defaultCat) {
                        defaultCat = new ReflectionCategory(
                            CategoryPlugin.defaultCategory
                        );
                        categories.push(defaultCat);
                    }
                }

                defaultCat.children.push(child);
                return;
            }
            for (const childCat of childCategories) {
                let category = categories.find((cat) => cat.title === childCat);

                if (category) {
                    category.children.push(child);
                    continue;
                }
                category = new ReflectionCategory(childCat);
                category.children.push(child);
                categories.push(category);
            }
        });
        return categories;
    }

    /**
     * Return the category of a given reflection.
     *
     * @param reflection The reflection.
     * @returns The category the reflection belongs to
     *
     * @privateRemarks
     * If you change this, also update getGroups in GroupPlugin accordingly.
     */
    getCategories(reflection: DeclarationReflection) {
        const categories = new Set<string>();
        function extractCategoryTags(comment: Comment | undefined) {
            if (!comment) return;
            removeIf(comment.blockTags, (tag) => {
                if (tag.tag === "@category") {
                    categories.add(
                        Comment.combineDisplayParts(tag.content).trim()
                    );

                    return true;
                }
                return false;
            });
        }

        extractCategoryTags(reflection.comment);
        for (const sig of reflection.getNonIndexSignatures()) {
            extractCategoryTags(sig.comment);
        }

        if (reflection.type?.type === "reflection") {
            extractCategoryTags(reflection.type.declaration.comment);
            for (const sig of reflection.type.declaration.getNonIndexSignatures()) {
                extractCategoryTags(sig.comment);
            }
        }

        categories.delete("");

        for (const cat of categories) {
            if (cat in this.boosts) {
                this.usedBoosts.add(cat);
                reflection.relevanceBoost =
                    (reflection.relevanceBoost ?? 1) * this.boosts[cat];
            }
        }

        return categories;
    }

    /**
     * Callback used to sort categories by name.
     *
     * @param a The left reflection to sort.
     * @param b The right reflection to sort.
     * @returns The sorting weight.
     */
    static sortCatCallback(
        a: ReflectionCategory,
        b: ReflectionCategory
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
}

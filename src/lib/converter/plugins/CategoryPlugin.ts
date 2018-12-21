import { Reflection, ContainerReflection, SourceDirectory, SourceFile } from '../../models';
import { ReflectionCategory } from '../../models/ReflectionCategory';
import { Component, ConverterComponent } from '../components';
import { Converter } from '../converter';
import { Context } from '../context';
import { Option } from '../../utils/component';
import { ParameterType } from '../../utils/options/declaration';

/**
 * A handler that sorts and categorizes the found reflections in the resolving phase.
 *
 * The handler sets the ´category´ property of all reflections.
 */
@Component({name: 'category'})
export class CategoryPlugin extends ConverterComponent {
    @Option({
        name: 'defaultCategory',
        help: 'Specifies the default category for reflections without a category.',
        type: ParameterType.String,
        defaultValue: 'Other'
    })
    defaultCategory!: string;

    @Option({
        name: 'categoryOrder',
        help: 'Specifies the order in which categories appear. * indicates the relative order for categories not in the list.',
        type: ParameterType.Array
    })
    categoryOrder!: string[];

    @Option({
        name: 'categorizeByGroup',
        help: 'Specifies whether categorization will be done at the group level.',
        type: ParameterType.Boolean,
        defaultValue: true
    })
    categorizeByGroup!: boolean;

    // For use in static methods
    static defaultCategory = 'Other';
    static WEIGHTS: string[] = [];

    /**
     * Create a new CategoryPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_BEGIN]:       this.onBegin,
            [Converter.EVENT_RESOLVE]:     this.onResolve,
            [Converter.EVENT_RESOLVE_END]: this.onEndResolve
        }, undefined, -200);
    }

    /**
     * Triggered when the converter begins converting a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onBegin(context: Context) {
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
    private onResolve(context: Context, reflection: Reflection) {
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
        // const self = this;
        // function walkDirectory(directory: SourceDirectory) {
        //     self.categorize(directory);

        //     for (let key in directory.directories) {
        //         if (!directory.directories.hasOwnProperty(key)) {
        //             continue;
        //         }
        //         walkDirectory(directory.directories[key]);
        //     }
        // }

        const project = context.project;
        this.categorize(project);

        // walkDirectory(project.directory);
        // project.files.forEach((file) => {
        //     this.categorize(file);
        // });
    }

    private categorize(obj: ContainerReflection | SourceDirectory | SourceFile) {
        if (this.categorizeByGroup) {
            this.groupCategorize(obj);
        } else {
            this.lumpCategorize(obj);
        }
    }

    private groupCategorize(obj: ContainerReflection | SourceDirectory | SourceFile) {
        if (!obj.groups || obj.groups.length === 0) {
            return;
        }
        obj.groups.forEach((group) => {
            group.categories = CategoryPlugin.getReflectionCategories(group.children);
            if (group.categories && group.categories.length > 1) {
                group.categories.sort(CategoryPlugin.sortCatCallback);
            } else if (group.categories.length === 1 && group.categories[0].title === CategoryPlugin.defaultCategory) {
                // no categories if everything is uncategorized
                group.categories = undefined;
            }
        });
    }

    private lumpCategorize(obj: ContainerReflection | SourceDirectory | SourceFile) {
        if (obj instanceof ContainerReflection) {
            if (obj.children && obj.children.length > 0) {
                obj.categories = CategoryPlugin.getReflectionCategories(obj.children);
            }
            if (obj.categories && obj.categories.length > 1) {
                obj.categories.sort(CategoryPlugin.sortCatCallback);
            }
        } else if (obj instanceof SourceDirectory) {
            obj.categories = CategoryPlugin.getReflectionCategories(obj.getAllReflections());
        } else {
            obj.categories = CategoryPlugin.getReflectionCategories(obj.reflections);
        }
    }

    /**
     * Create a categorized representation of the given list of reflections.
     *
     * @param reflections  The reflections that should be categorized.
     * @returns An array containing all children of the given reflection categorized
     */
    static getReflectionCategories(reflections: Reflection[]): ReflectionCategory[] {
        const categories: ReflectionCategory[] = [];
        let defaultCat: ReflectionCategory | undefined;
        reflections.forEach((child) => {
            const childCat = CategoryPlugin.getCategory(child);
            if (childCat === '') {
                if (!defaultCat) {
                    defaultCat = categories.find(category => category.title === CategoryPlugin.defaultCategory);
                    if (!defaultCat) {
                        defaultCat = new ReflectionCategory(CategoryPlugin.defaultCategory);
                        categories.push(defaultCat);
                    }
                }
                defaultCat.children.push(child);
                return;
            }
            let category = categories.find(cat => cat.title === childCat);
            if (category) {
                category.children.push(child);
                return;
            }
            category = new ReflectionCategory(childCat);
            category.children.push(child);
            categories.push(category);
        });
        return categories;
    }

    /**
     * Return the category of a given reflection.
     *
     * @param reflection The reflection.
     * @returns The category the reflection belongs to
     */
    static getCategory(reflection: Reflection): string {
        if (reflection.comment) {
            const tags = reflection.comment.tags;
            if (tags) {
                for (let i = 0; i < tags.length; i++) {
                    if (tags[i].tagName === 'category') {
                        let tag = tags[i].text;
                        return tag.trim();
                    }
                }
            }
        }
        return '';
    }

    /**
     * Callback used to sort reflections by name.
     *
     * @param a The left reflection to sort.
     * @param b The right reflection to sort.
     * @returns The sorting weight.
     */
    static sortCallback(a: Reflection, b: Reflection): number {
        return a.name > b.name ? 1 : -1;
    }

    /**
     * Callback used to sort categories by name.
     *
     * @param a The left reflection to sort.
     * @param b The right reflection to sort.
     * @returns The sorting weight.
     */
    static sortCatCallback(a: ReflectionCategory, b: ReflectionCategory): number {
        const aWeight = CategoryPlugin.WEIGHTS.indexOf(a.title);
        const bWeight = CategoryPlugin.WEIGHTS.indexOf(b.title);
        if (aWeight < 0 && bWeight < 0) {
            return a.title > b.title ? 1 : -1;
        }
        if (aWeight < 0) {
            return 1;
        }
        if (bWeight < 0) {
            return -1;
        }
        return aWeight - bWeight;
    }
}

import { Reflection, ContainerReflection } from '../../models/reflections/index';
import { ReflectionCategory } from '../../models/ReflectionCategory';
import { SourceDirectory } from '../../models/sources/directory';
import { Component, ConverterComponent } from '../components';
import { Converter } from '../converter';
import { Context } from '../context';
import { GroupPlugin } from './GroupPlugin';

/**
 * A handler that sorts and categorizes the found reflections in the resolving phase.
 *
 * The handler sets the ´category´ property of all reflections.
 */
@Component({name: 'category'})
export class CategoryPlugin extends ConverterComponent {
    /**
     * Define the sort order of categories. By default, sort alphabetically.
     */
    static WEIGHTS = [];

    /**
     * Create a new CategoryPlugin instance.
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
    private onResolve(context: Context, reflection: Reflection) {
        if (reflection instanceof ContainerReflection) {
            const container = <ContainerReflection> reflection;
            if (container.children && container.children.length > 0) {
                container.children.sort(GroupPlugin.sortCallback);
                container.categories = CategoryPlugin.getReflectionCategories(container.children);
            }
            if (container.categories && container.categories.length > 1) {
                container.categories.sort(CategoryPlugin.sortCatCallback);
            }
        }
    }

    /**
     * Triggered when the converter has finished resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onEndResolve(context: Context) {
        function walkDirectory(directory: SourceDirectory) {
            directory.categories = CategoryPlugin.getReflectionCategories(directory.getAllReflections());

            for (let key in directory.directories) {
                if (!directory.directories.hasOwnProperty(key)) {
                    continue;
                }
                walkDirectory(directory.directories[key]);
            }
        }

        const project = context.project;
        if (project.children && project.children.length > 0) {
            project.children.sort(GroupPlugin.sortCallback);
            project.categories = CategoryPlugin.getReflectionCategories(project.children);
        }
        if (project.categories && project.categories.length > 1) {
            project.categories.sort(CategoryPlugin.sortCatCallback);
        }

        walkDirectory(project.directory);
        project.files.forEach((file) => {
            file.categories = CategoryPlugin.getReflectionCategories(file.reflections);
        });
    }

    /**
     * Create a categorized representation of the given list of reflections.
     *
     * @param reflections  The reflections that should be categorized.
     * @returns An array containing all children of the given reflection categorized
     */
    static getReflectionCategories(reflections: Reflection[]): ReflectionCategory[] {
        const categories: ReflectionCategory[] = [];
        reflections.forEach((child) => {
            const childCat = CategoryPlugin.getCategory(child);
            if (childCat === '') {
              return;
            }
            for (let i = 0; i < categories.length; i++) {
                const category = categories[i];

                if (category.title !== childCat) {
                    continue;
                }

                category.children.push(child);
                return;
            }

            const category = new ReflectionCategory(childCat);
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
                        return (tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()).trim();
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

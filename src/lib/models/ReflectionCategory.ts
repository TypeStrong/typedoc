import { Reflection } from './reflections/abstract';

/**
 * A category of reflections.
 *
 * Reflection categories are created by the ´CategoryPlugin´ in the resolving phase
 * of the dispatcher. The main purpose of categories is to be able to more easily
 * render human readable children lists in templates.
 */
export class ReflectionCategory {
    /**
     * The title, a string representation of this category.
     */
    title: string;

    /**
     * All reflections of this category.
     */
    children: Reflection[] = [];

    /**
     * Do all children of this category have a separate document?
     *
     * A bound representation of the ´ReflectionCategory.getAllChildrenHaveOwnDocument´
     * that can be used within templates.
     */
    allChildrenHaveOwnDocument: Function;

    /**
     * Create a new ReflectionCategory instance.
     *
     * @param title The title of this category.
     */
    constructor(title: string) {
        this.title = title;

        this.allChildrenHaveOwnDocument = (() => this.getAllChildrenHaveOwnDocument());
    }

    /**
     * Do all children of this category have a separate document?
     */
    private getAllChildrenHaveOwnDocument(): boolean {
        let onlyOwnDocuments = true;
        this.children.forEach((child) => {
            onlyOwnDocuments = onlyOwnDocuments && !!child.hasOwnDocument;
        });

        return onlyOwnDocuments;
    }

    /**
     * Return a raw object representation of this reflection category.
     * @deprecated Use serializers instead
     */
    toObject(): any {
        const result = {
            title: this.title
        };

        if (this.children) {
            const children: any[] = [];
            this.children.forEach((child) => {
                children.push(child.id);
            });

            result['children'] = children;
        }

        return result;
    }
}

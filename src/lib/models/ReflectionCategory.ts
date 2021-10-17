import type { DeclarationReflection } from ".";

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
    children: DeclarationReflection[] = [];

    /**
     * Create a new ReflectionCategory instance.
     *
     * @param title The title of this category.
     */
    constructor(title: string) {
        this.title = title;
    }

    /**
     * Do all children of this category have a separate document?
     */
    allChildrenHaveOwnDocument(): boolean {
        return this.children.every((child) => child.hasOwnDocument);
    }
}

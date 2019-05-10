import { Reflection, ReflectionKind } from './reflections/abstract';
import { ReflectionCategory } from './ReflectionCategory';

/**
 * A group of reflections. All reflections in a group are of the same kind.
 *
 * Reflection groups are created by the ´GroupHandler´ in the resolving phase
 * of the dispatcher. The main purpose of groups is to be able to more easily
 * render human readable children lists in templates.
 */
export class ReflectionGroup {
    /**
     * The title, a string representation of the typescript kind, of this group.
     */
    title: string;

    /**
     * The original typescript kind of the children of this group.
     */
    kind: ReflectionKind;

    /**
     * All reflections of this group.
     */
    children: Reflection[] = [];

    /**
     * A list of generated css classes that should be applied to representations of this
     * group in the generated markup.
     */
    cssClasses?: string;

    /**
     * Do all children of this group have a separate document?
     *
     * A bound representation of the ´ReflectionGroup.getAllChildrenHaveOwnDocument´
     * that can be used within templates.
     */
    allChildrenHaveOwnDocument: Function;

    /**
     * Are all children inherited members?
     */
    allChildrenAreInherited?: boolean;

    /**
     * Are all children private members?
     */
    allChildrenArePrivate?: boolean;

    /**
     * Are all children private or protected members?
     */
    allChildrenAreProtectedOrPrivate?: boolean;

    /**
     * Are all children external members?
     */
    allChildrenAreExternal?: boolean;

    /**
     * Are any children exported declarations?
     */
    someChildrenAreExported?: boolean;

    /**
     * Categories contained within this group.
     */
    categories?: ReflectionCategory[];

    /**
     * Create a new ReflectionGroup instance.
     *
     * @param title The title of this group.
     * @param kind  The original typescript kind of the children of this group.
     */
    constructor(title: string, kind: ReflectionKind) {
        this.title = title;
        this.kind = kind;

        this.allChildrenHaveOwnDocument = (() => this.getAllChildrenHaveOwnDocument());
    }

    /**
     * Do all children of this group have a separate document?
     */
    private getAllChildrenHaveOwnDocument(): boolean {
        let onlyOwnDocuments = true;
        this.children.forEach((child) => {
            onlyOwnDocuments = onlyOwnDocuments && !!child.hasOwnDocument;
        });

        return onlyOwnDocuments;
    }

    /**
     * Return a raw object representation of this reflection group.
     * @deprecated Use serializers instead
     */
    toObject(): any {
        const result = {
            title: this.title,
            kind:  this.kind
        };

        if (this.children) {
            const children: any[] = [];
            this.children.forEach((child) => {
                children.push(child.id);
            });

            result['children'] = children;
        }

        if (this.categories) {
            const categories: any[] = [];
            this.categories.forEach((category) => {
                categories.push(category.toObject());
            });

            result['categories'] = categories;
        }

        return result;
    }
}

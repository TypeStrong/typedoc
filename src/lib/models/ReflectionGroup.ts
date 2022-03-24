import type { ReflectionKind } from "./reflections/kind";
import type { ReflectionCategory } from "./ReflectionCategory";
import type { DeclarationReflection } from ".";
import type { Serializer, JSONOutput } from "../serialization";

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
    children: DeclarationReflection[] = [];

    /**
     * A list of generated css classes that should be applied to representations of this
     * group in the generated markup.
     */
    cssClasses?: string;

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
    }

    /**
     * Do all children of this group have a separate document?
     */
    allChildrenHaveOwnDocument(): boolean {
        return this.children.every((child) => child.hasOwnDocument);
    }

    toObject(serializer: Serializer): JSONOutput.ReflectionGroup {
        return {
            title: this.title,
            kind: this.kind,
            children:
                this.children.length > 0
                    ? this.children.map((child) => child.id)
                    : undefined,
            categories:
                this.categories && this.categories.length > 0
                    ? this.categories.map((category) =>
                          serializer.toObject(category)
                      )
                    : undefined,
        };
    }
}

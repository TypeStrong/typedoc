import { ReflectionCategory } from "./ReflectionCategory";
import { Comment } from "./comments";
import type {
    CommentDisplayPart,
    DeclarationReflection,
    DocumentReflection,
    Reflection,
} from ".";
import type { Serializer, JSONOutput, Deserializer } from "../serialization";

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
     * User specified description via `@groupDescription`, if specified.
     */
    description?: CommentDisplayPart[];

    /**
     * All reflections of this group.
     */
    children: Array<DeclarationReflection | DocumentReflection> = [];

    /**
     * Categories contained within this group.
     */
    categories?: ReflectionCategory[];

    /**
     * Create a new ReflectionGroup instance.
     *
     * @param title The title of this group.
     * @param owningReflection The reflection containing this group, useful for changing rendering based on a comment on a reflection.
     */
    constructor(
        title: string,
        readonly owningReflection: Reflection,
    ) {
        this.title = title;
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
            description: this.description
                ? Comment.serializeDisplayParts(serializer, this.description)
                : undefined,
            children:
                this.children.length > 0
                    ? this.children.map((child) => child.id)
                    : undefined,
            categories: serializer.toObjectsOptional(this.categories),
        };
    }

    fromObject(de: Deserializer, obj: JSONOutput.ReflectionGroup) {
        if (obj.description) {
            this.description = Comment.deserializeDisplayParts(
                de,
                obj.description,
            );
        }

        if (obj.categories) {
            this.categories = obj.categories.map((catObj) => {
                const cat = new ReflectionCategory(catObj.title);
                de.fromObject(cat, catObj);
                return cat;
            });
        }

        if (obj.children) {
            de.defer((project) => {
                for (const childId of obj.children || []) {
                    const child = project.getReflectionById(
                        de.oldIdToNewId[childId] ?? -1,
                    );
                    if (child?.isDeclaration()) {
                        this.children.push(child);
                    }
                }
            });
        }
    }
}

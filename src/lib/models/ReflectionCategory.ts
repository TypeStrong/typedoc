import { Comment } from "./comments";
import type {
    CommentDisplayPart,
    DeclarationReflection,
    DocumentReflection,
} from ".";
import type { Serializer, JSONOutput, Deserializer } from "../serialization";

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
     * The user specified description, if any, set with `@categoryDescription`
     */
    description?: CommentDisplayPart[];

    /**
     * All reflections of this category.
     */
    children: Array<DeclarationReflection | DocumentReflection> = [];

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

    toObject(serializer: Serializer): JSONOutput.ReflectionCategory {
        return {
            title: this.title,
            description: this.description
                ? Comment.serializeDisplayParts(serializer, this.description)
                : undefined,
            children:
                this.children.length > 0
                    ? this.children.map((child) => child.id)
                    : undefined,
        };
    }

    fromObject(de: Deserializer, obj: JSONOutput.ReflectionCategory) {
        if (obj.description) {
            this.description = Comment.deserializeDisplayParts(
                de,
                obj.description,
            );
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

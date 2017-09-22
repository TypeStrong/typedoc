import { Reflection, ReflectionKind, TraverseCallback, TraverseProperty } from './abstract';
import { ReflectionCategory } from '../ReflectionCategory';
import { ReflectionGroup } from '../ReflectionGroup';
import { DeclarationReflection } from './declaration';

export class ContainerReflection extends Reflection {
    /**
     * The children of this reflection.
     */
    children: DeclarationReflection[];

    /**
     * All children grouped by their kind.
     */
    groups: ReflectionGroup[];

    /**
     * All children grouped by their category.
     */
    categories: ReflectionCategory[];

    /**
     * Return a list of all children of a certain kind.
     *
     * @param kind  The desired kind of children.
     * @returns     An array containing all children with the desired kind.
     */
    getChildrenByKind(kind: ReflectionKind): DeclarationReflection[] {
        const values: DeclarationReflection[] = [];
        for (let key in this.children) {
            const child = this.children[key];
            if (child.kindOf(kind)) {
                values.push(child);
            }
        }
        return values;
    }

    /**
     * Traverse all potential child reflections of this reflection.
     *
     * The given callback will be invoked for all children, signatures and type parameters
     * attached to this reflection.
     *
     * @param callback  The callback function that should be applied for each child reflection.
     */
    traverse(callback: TraverseCallback) {
        if (this.children) {
            this.children.forEach((child: DeclarationReflection) => {
                callback(child, TraverseProperty.Children);
            });
        }
    }

    /**
     * Return a raw object representation of this reflection.
     */
    toObject(): any {
        const result = super.toObject();

        if (this.groups) {
            const groups: any[] = [];
            this.groups.forEach((group) => {
                groups.push(group.toObject());
            });

            result['groups'] = groups;
        }

        if (this.categories) {
            const categories: any[] = [];
            this.categories.forEach((category) => {
                categories.push(category.toObject());
            });

            if (categories.length > 0) {
                result['categories'] = categories;
            }
        }

        if (this.sources) {
          const sources: any[] = [];
          this.sources.forEach((source) => {
              sources.push({
                fileName: source.fileName,
                line: source.line,
                character: source.character
              });
          });

          result['sources'] = sources;
        }

        return result;
    }
}

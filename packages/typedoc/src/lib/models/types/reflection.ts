import { DeclarationReflection } from '../reflections/declaration';
import { Type } from './abstract';

/**
 * Represents a type which has it's own reflection like literal types.
 *
 * ~~~
 * let value: {subValueA;subValueB;subValueC;};
 * ~~~
 */
export class ReflectionType extends Type {
    /**
     * The reflection of the type.
     */
    declaration: DeclarationReflection;

    /**
     * The type name identifier.
     */
    readonly type: string = 'reflection';

    /**
     * Create a new instance of ReflectionType.
     *
     * @param declaration  The reflection of the type.
     */
    constructor(declaration: DeclarationReflection) {
        super();
        this.declaration = declaration;
    }

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        return new ReflectionType(this.declaration);
    }

    /**
     * Test whether this type equals the given type.
     *
     * @param type  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(type: ReflectionType): boolean {
        return type === this;
    }

    /**
     * Return a raw object representation of this type.
     * @deprecated Use serializers instead
     */
    toObject(): any {
        const result: any = super.toObject();

        if (this.declaration) {
            result.declaration = this.declaration.toObject();
        }

        return result;
    }

    /**
     * Return a string representation of this type.
     */
    toString() {
        if (!this.declaration.children && this.declaration.signatures) {
            return 'function';
        } else {
            return 'object';
        }
    }
}

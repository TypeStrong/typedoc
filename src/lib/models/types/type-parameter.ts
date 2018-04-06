import { Type } from './abstract';

/**
 * Represents a type parameter type.
 *
 * ~~~
 * let value: T;
 * ~~~
 */
export class TypeParameterType extends Type {
    /**
     *
     */
    name: string;

    constraint: Type;

    /**
     * The type name identifier.
     */
    readonly type: string = 'typeParameter';

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        const clone = new TypeParameterType();
        clone.name = this.name;
        clone.constraint = this.constraint;
        return clone;
    }

    /**
     * Test whether this type equals the given type.
     *
     * @param type  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(type: TypeParameterType): boolean {
        if (!(type instanceof TypeParameterType)) {
            return false;
        }

        if (this.constraint && type.constraint) {
            return type.constraint.equals(this.constraint);
        } else if (!this.constraint && !type.constraint) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Return a raw object representation of this type.
     * @deprecated Use serializers instead
     */
    toObject(): any {
        const result: any = super.toObject();
        result.name = this.name;

        if (this.constraint) {
            result.constraint = this.constraint.toObject();
        }

        return result;
    }

    /**
     * Return a string representation of this type.
     */
    toString() {
        return this.name;
    }
}

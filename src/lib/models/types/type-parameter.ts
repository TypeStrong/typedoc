import { Type } from "./abstract";

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
    readonly name: string;

    constraint?: Type;

    /**
     * Default type for the type parameter.
     *
     * ```
     * class SomeClass<T = {}>
     * ```
     */
    default?: Type;

    /**
     * The type name identifier.
     */
    readonly type: string = "typeParameter";

    constructor(name: string) {
        super();
        this.name = name;
    }

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        const clone = new TypeParameterType(this.name);
        clone.constraint = this.constraint;
        clone.default = this.default;
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

        let constraintEquals = false;

        if (this.constraint && type.constraint) {
            constraintEquals = type.constraint.equals(this.constraint);
        } else if (!this.constraint && !type.constraint) {
            constraintEquals = true;
        }

        let defaultEquals = false;

        if (this.default && type.default) {
            defaultEquals = type.default.equals(this.default);
        } else if (!this.default && !type.default) {
            defaultEquals = true;
        }

        return constraintEquals && defaultEquals;
    }

    /**
     * Return a string representation of this type.
     */
    toString(): string {
        return this.name;
    }
}

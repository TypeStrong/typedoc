import { Type } from "./abstract";

/**
 * Represents a type operator type.
 *
 * ~~~
 * class A {}
 * class B<T extends keyof A> {}
 * ~~~
 */
export class TypeOperatorType extends Type {
    /**
     * The type name identifier.
     */
    readonly type = "typeOperator";

    constructor(
        public target: Type,
        public operator: "keyof" | "unique" | "readonly"
    ) {
        super();
    }

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        return new TypeOperatorType(this.target.clone(), this.operator);
    }

    /**
     * Test whether this type equals the given type.
     *
     * @param type  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(type: TypeOperatorType): boolean {
        if (!(type instanceof TypeOperatorType)) {
            return false;
        }

        return (
            type instanceof TypeOperatorType &&
            type.operator === this.operator &&
            type.target.equals(this.target)
        );
    }

    /**
     * Return a string representation of this type.
     */
    toString() {
        return `${this.operator} ${this.target.toString()}`;
    }
}

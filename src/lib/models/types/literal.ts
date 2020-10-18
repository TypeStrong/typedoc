import { Type } from "./abstract";

/**
 * Represents a string literal type.
 *
 * ```ts
 * type A = "A"
 * type B = 1
 * ```
 */
export class LiteralType extends Type {
    value: string | number | boolean;

    /**
     * The type name identifier.
     */
    readonly type = "literal";

    constructor(value: string | number | boolean) {
        super();
        this.value = value;
    }

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        return new LiteralType(this.value);
    }

    /**
     * Test whether this type equals the given type.
     *
     * @param other  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(other: LiteralType): boolean {
        return other instanceof LiteralType && other.value === this.value;
    }

    /**
     * Return a string representation of this type.
     */
    toString(): string {
        return JSON.stringify(this.value);
    }
}

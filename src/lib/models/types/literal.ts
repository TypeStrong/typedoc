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
    value: string | number | boolean | null | bigint;

    /**
     * The type name identifier.
     */
    override readonly type = "literal";

    constructor(value: LiteralType["value"]) {
        super();
        this.value = value;
    }

    /**
     * Return a string representation of this type.
     */
    override toString(): string {
        if (typeof this.value === "bigint") {
            return this.value.toString();
        }
        return JSON.stringify(this.value);
    }
}

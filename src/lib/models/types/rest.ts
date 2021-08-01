import { Type } from "./abstract";

/**
 * Represents a rest type
 * ```ts
 * type Z = [1, ...2[]]
 * //           ^^^^^^
 * ```
 */
export class RestType extends Type {
    /**
     * The type of the rest array elements.
     */
    elementType: Type;

    /**
     * The type name identifier.
     */
    override readonly type = "rest";

    /**
     * Create a new RestType instance.
     *
     * @param elementType The type of the array's elements.
     */
    constructor(elementType: Type) {
        super();
        this.elementType = elementType;
    }

    /**
     * Return a string representation of this type.
     */
    override toString() {
        return `...${this.elementType.toString()}`;
    }
}

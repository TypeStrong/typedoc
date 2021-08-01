import { Type } from "./abstract";
import { IntersectionType } from "./intersection";
import { UnionType } from "./union";

/**
 * Represents an array type.
 *
 * ~~~
 * let value: string[];
 * ~~~
 */
export class ArrayType extends Type {
    /**
     * The type of the array elements.
     */
    elementType: Type;

    /**
     * The type name identifier.
     */
    override readonly type = "array";

    /**
     * Create a new TupleType instance.
     *
     * @param elementType  The type of the array's elements.
     */
    constructor(elementType: Type) {
        super();
        this.elementType = elementType;
    }

    /**
     * Return a string representation of this type.
     */
    override toString() {
        const elementTypeStr = this.elementType.toString();
        if (
            this.elementType instanceof UnionType ||
            this.elementType instanceof IntersectionType
        ) {
            return "(" + elementTypeStr + ")[]";
        } else {
            return elementTypeStr + "[]";
        }
    }
}

import { Type, UnionType, IntersectionType } from './index';

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
    readonly type: string = 'array';

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
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        return new ArrayType(this.elementType);
    }

    /**
     * Test whether this type equals the given type.
     *
     * @param type  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(type: Type): boolean {
        if (!(type instanceof ArrayType)) {
            return false;
        }
        return type.elementType.equals(this.elementType);
    }

    /**
     * Return a raw object representation of this type.
     * @deprecated Use serializers instead
     */
    toObject(): any {
        const result: any = super.toObject();
        result.elementType = this.elementType.toObject();

        return result;
    }

    /**
     * Return a string representation of this type.
     */
    toString() {
        const elementTypeStr = this.elementType.toString();
        if (this.elementType instanceof UnionType || this.elementType instanceof IntersectionType) {
            return '(' + elementTypeStr + ')[]';
        } else {
            return elementTypeStr + '[]';
        }
    }
}

import { Type } from './abstract';

/**
 * Represents a tuple type.
 *
 * ~~~
 * let value: [string,boolean];
 * ~~~
 */
export class TupleType extends Type {
    /**
     * The ordered type elements of the tuple type.
     */
    elements: Type[];

    /**
     * The type name identifier.
     */
    readonly type: string = 'tuple';

    /**
     * Create a new TupleType instance.
     *
     * @param elements  The ordered type elements of the tuple type.
     */
    constructor(elements: Type[]) {
        super();
        this.elements = elements;
    }

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        return new TupleType(this.elements);
    }

    /**
     * Test whether this type equals the given type.
     *
     * @param type  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(type: TupleType): boolean {
        if (!(type instanceof TupleType)) {
            return false;
        }
        return Type.isTypeListEqual(type.elements, this.elements);
    }

    /**
     * Return a raw object representation of this type.
     * @deprecated Use serializers instead
     */
    toObject(): any {
        const result: any = super.toObject();

        if (this.elements && this.elements.length) {
            result.elements = this.elements.map((e) => e.toObject());
        }

        return result;
    }

    /**
     * Return a string representation of this type.
     */
    toString() {
        const names: string[] = [];
        this.elements.forEach((element) => {
            names.push(element.toString());
        });

        return '[' + names.join(', ') + ']';
    }
}

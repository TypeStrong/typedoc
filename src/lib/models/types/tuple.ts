import { Type } from "./abstract";

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
    readonly type = "tuple";

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
     * Return a string representation of this type.
     */
    toString() {
        const names: string[] = [];
        this.elements.forEach((element) => {
            names.push(element.toString());
        });

        return "[" + names.join(", ") + "]";
    }
}

export class NamedTupleMember extends Type {
    readonly type = "named-tuple-member";

    constructor(
        public name: string,
        public isOptional: boolean,
        public element: Type
    ) {
        super();
    }

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        return new NamedTupleMember(
            this.name,
            this.isOptional,
            this.element.clone()
        );
    }

    /**
     * Test whether this type equals the given type.
     *
     * @param type  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(type: Type): boolean {
        if (!(type instanceof NamedTupleMember)) {
            return false;
        }
        return (
            this.isOptional === type.isOptional &&
            this.element.equals(type.element)
        );
    }

    /**
     * Return a string representation of this type.
     */
    toString() {
        return `${this.name}${this.isOptional ? "?" : ""}: ${this.element}`;
    }
}

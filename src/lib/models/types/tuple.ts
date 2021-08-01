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
    override readonly type = "tuple";

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
     * Return a string representation of this type.
     */
    override toString() {
        const names: string[] = [];
        this.elements.forEach((element) => {
            names.push(element.toString());
        });

        return "[" + names.join(", ") + "]";
    }
}

export class NamedTupleMember extends Type {
    override readonly type = "named-tuple-member";

    constructor(
        public name: string,
        public isOptional: boolean,
        public element: Type
    ) {
        super();
    }

    /**
     * Return a string representation of this type.
     */
    override toString() {
        return `${this.name}${this.isOptional ? "?" : ""}: ${this.element}`;
    }
}

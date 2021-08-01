import { Type } from "./abstract";

/**
 * Represents an intersection type.
 *
 * ~~~
 * let value: A & B;
 * ~~~
 */
export class IntersectionType extends Type {
    /**
     * The types this union consists of.
     */
    types: Type[];

    /**
     * The type name identifier.
     */
    override readonly type: string = "intersection";

    /**
     * Create a new TupleType instance.
     *
     * @param types  The types this union consists of.
     */
    constructor(types: Type[]) {
        super();
        this.types = types;
    }

    /**
     * Return a string representation of this type.
     */
    override toString() {
        const names: string[] = [];
        this.types.forEach((element) => {
            names.push(element.toString());
        });

        return names.join(" & ");
    }
}

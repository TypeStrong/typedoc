import { Type } from "./abstract";
import { IntrinsicType } from "./intrinsic";
import { LiteralType } from "./literal";

/**
 * Represents an union type.
 *
 * ~~~
 * let value: string | string[];
 * ~~~
 */
export class UnionType extends Type {
    /**
     * The types this union consists of.
     */
    types: Type[];

    /**
     * The type name identifier.
     */
    override readonly type: string = "union";

    /**
     * Create a new TupleType instance.
     *
     * @param types  The types this union consists of.
     */
    constructor(types: Type[]) {
        super();
        this.types = types;
        this.normalize();
    }

    /**
     * Return a string representation of this type.
     */
    override toString() {
        const names: string[] = [];
        this.types.forEach((element) => {
            names.push(element.toString());
        });

        return names.join(" | ");
    }

    private normalize() {
        const trueIndex = this.types.findIndex(
            (t) => t instanceof LiteralType && t.value === true
        );
        const falseIndex = this.types.findIndex(
            (t) => t instanceof LiteralType && t.value === false
        );

        if (trueIndex !== -1 && falseIndex !== -1) {
            this.types.splice(Math.max(trueIndex, falseIndex), 1);
            this.types.splice(
                Math.min(trueIndex, falseIndex),
                1,
                new IntrinsicType("boolean")
            );
        }
    }
}

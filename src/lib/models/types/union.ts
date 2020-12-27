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
    readonly type: string = "union";

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
     * Clone this type.
     *
     * @return A clone of this type.
     */
    clone(): Type {
        return new UnionType(this.types);
    }

    /**
     * Test whether this type equals the given type.
     *
     * @param type  The type that should be checked for equality.
     * @returns TRUE if the given type equals this type, FALSE otherwise.
     */
    equals(type: UnionType): boolean {
        if (!(type instanceof UnionType)) {
            return false;
        }
        return Type.isTypeListSimilar(type.types, this.types);
    }

    /**
     * Return a string representation of this type.
     */
    toString() {
        const names: string[] = [];
        this.types.forEach((element) => {
            names.push(element.toString());
        });

        return names.join(" | ");
    }

    private normalize() {
        const trueIndex = this.types.findIndex((t) =>
            t.equals(new LiteralType(true))
        );
        const falseIndex = this.types.findIndex((t) =>
            t.equals(new LiteralType(false))
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

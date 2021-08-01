import { Type } from "./abstract";

/**
 * Represents an intrinsic type like `string` or `boolean`.
 *
 * ~~~
 * let value: number;
 * ~~~
 */
export class IntrinsicType extends Type {
    /**
     * The name of the intrinsic type like `string` or `boolean`.
     */
    name: string;

    /**
     * The type name identifier.
     */
    override readonly type = "intrinsic";

    /**
     * Create a new instance of IntrinsicType.
     *
     * @param name  The name of the intrinsic type like `string` or `boolean`.
     */
    constructor(name: string) {
        super();
        this.name = name;
    }

    /**
     * Return a string representation of this type.
     */
    override toString() {
        return this.name;
    }
}

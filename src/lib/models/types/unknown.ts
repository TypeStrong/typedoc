import { Type } from "./abstract";

/**
 * Represents all unknown types.
 */
export class UnknownType extends Type {
    /**
     * A string representation of the type as returned from TypeScript compiler.
     */
    name: string;

    /**
     * The type name identifier.
     */
    override readonly type = "unknown";

    /**
     * Create a new instance of UnknownType.
     *
     * @param name  A string representation of the type as returned from TypeScript compiler.
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

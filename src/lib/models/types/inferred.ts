import { Type } from "./abstract";

/**
 * Represents an inferred type, U in the example below.
 *
 * ```ts
 * type Z = Promise<string> extends Promise<infer U> : never
 * ```
 */
export class InferredType extends Type {
    /**
     * The type name identifier.
     */
    override readonly type = "inferred";

    constructor(public name: string) {
        super();
    }

    /**
     * Return a string representation of this type.
     */
    override toString() {
        return `infer ${this.name}`;
    }
}

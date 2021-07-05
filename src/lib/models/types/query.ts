import { Type } from "./abstract";
import { ReferenceType } from "./reference";

/**
 * Represents a type that is constructed by querying the type of a reflection.
 * ```ts
 * const x = 1
 * type Z = typeof x // query on reflection for x
 * ```
 */
export class QueryType extends Type {
    readonly queryType: ReferenceType;

    override readonly type = "query";

    constructor(reference: ReferenceType) {
        super();
        this.queryType = reference;
    }

    clone(): Type {
        return new QueryType(this.queryType);
    }

    override equals(other: Type): boolean {
        return (
            other instanceof QueryType && this.queryType.equals(other.queryType)
        );
    }

    override toString() {
        return `typeof ${this.queryType.toString()}`;
    }
}

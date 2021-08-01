import { Type } from "./abstract";

/**
 * Represents a type operator type.
 *
 * ~~~
 * class A {}
 * class B<T extends keyof A> {}
 * ~~~
 */
export class TypeOperatorType extends Type {
    /**
     * The type name identifier.
     */
    override readonly type = "typeOperator";

    constructor(
        public target: Type,
        public operator: "keyof" | "unique" | "readonly"
    ) {
        super();
    }

    /**
     * Return a string representation of this type.
     */
    override toString() {
        return `${this.operator} ${this.target.toString()}`;
    }
}

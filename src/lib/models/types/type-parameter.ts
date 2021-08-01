import { Type } from "./abstract";

/**
 * Represents a type parameter type.
 *
 * ~~~
 * let value: T;
 * ~~~
 */
export class TypeParameterType extends Type {
    /**
     *
     */
    readonly name: string;

    constraint?: Type;

    /**
     * Default type for the type parameter.
     *
     * ```
     * class SomeClass<T = {}>
     * ```
     */
    default?: Type;

    /**
     * The type name identifier.
     */
    override readonly type: string = "typeParameter";

    constructor(name: string) {
        super();
        this.name = name;
    }

    /**
     * Return a string representation of this type.
     */
    override toString(): string {
        return this.name;
    }
}

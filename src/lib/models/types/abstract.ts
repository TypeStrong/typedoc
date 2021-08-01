/**
 * Base class of all type definitions.
 */
export abstract class Type {
    /**
     * The type name identifier.
     */
    abstract readonly type: string;

    /**
     * Return a string representation of this type.
     */
    abstract toString(): string;
}

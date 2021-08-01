/**
 * Base class of all type definitions.
 */
export abstract class Type {
    /**
     * The type name identifier.
     */
    abstract readonly type: string;

    /**
     * Clone this type.
     *
     * @return A clone of this type.
     */
    abstract clone(): Type;

    /**
     * Return a string representation of this type.
     */
    abstract toString(): string;
}

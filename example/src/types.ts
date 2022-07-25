/** A simple type alias defined using the `type` keyword. */
export type SimpleTypeAlias = string | number | boolean;

/** A complex generic type. */
export type ComplexGenericTypeAlias<T> =
    | T
    | T[]
    | Promise<T>
    | Promise<T[]>
    | Record<string, Promise<T>>;

/**
 * A simple interface. Each property has its own doc comment.
 *
 * TypeDoc even supports doc comments on nested type definitions, as shown by the `name` property.
 */
export interface User {
    /** The user's ID. */
    id: number;

    /** The user's email address. */
    email: string;

    /** The user's name. */
    name: {
        /** The person's given name. */
        first: string;

        /** The person's family name. */
        last: string;
    };
}

/**
 * An interface that extends {@link User | `User`} and adds more properties.
 *
 * Notice how TypeDoc automatically shows the inheritance hierarchy and where
 * each property was originally defined.
 */
export interface AdminUser extends User {
    administrativeArea: "sales" | "delivery" | "billing";
    jobTitle: string;
}

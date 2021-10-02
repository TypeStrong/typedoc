/** An integer enum. */
export enum IntegerEnum {
    Pending,

    /** Indicates that a courier is en route delivering this order. */
    InProgress,

    Complete,
}

/** A string enum. */
export enum StringEnum {
    Pending = "pending",

    /** Indicates that a courier is en route delivering this order. */
    InProgress = "inProgress",

    Complete = "complete",
}

/** A [const enum](https://www.typescriptlang.org/docs/handbook/enums.html#const-enums). */
export const enum ConstEnum {
    Pending,

    /** Indicates that a courier is en route delivering this order. */
    InProgress,

    Complete,
}

/**
 * [A crazy enum from the TypeScript
 * handbook](https://www.typescriptlang.org/docs/handbook/enums.html#computed-and-constant-members).
 * This enum contains both constant and computed members.
 */
export enum CrazyEnum {
    // constant members
    None,
    Read = 1 << 1,
    Write = 1 << 2,
    ReadWrite = Read | Write,
    // computed member
    ComputedMember = "123".length,
}

/**
 * @enum
 *
 * Since TypeScript's `enum` can be inconvenient to work with, some packages define their own enum-like objects:
 *
 * ```
 * export const EnumLikeObject = {
 *     Pending: 'pending',
 *     InProgress: 'inProgress',
 *     Completed: 'completed'
 * } as const
 * ```
 *
 * Use the `@enum` tag to make TypeDoc document this object as an enum.
 */
export const EnumLikeObject = {
    Pending: "pending",

    /** Indicates that a courier is en route delivering this order. */
    InProgress: "inProgress",

    Completed: "completed",
} as const;

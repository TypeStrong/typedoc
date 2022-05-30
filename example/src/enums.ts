/** Describes the status of a delivery order. */
export enum SimpleEnum {
    /** This order has just been placed and is yet to be processed. */
    Pending,

    /** A courier is en route delivering this order. */
    InProgress,

    /** The order has been delivered. */
    Complete = "COMPLETE",
}

/**
 * [A crazy enum from the TypeScript
 * handbook](https://www.typescriptlang.org/docs/handbook/enums.html#computed-and-constant-members).
 * This enum contains both constant and computed members.
 *
 * TypeDoc won't show the value of computed members since this information is
 * only available at runtime.
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
 *
 * @enum
 */
export const EnumLikeObject = {
    Pending: "pending",

    /** Indicates that a courier is en route delivering this order. */
    InProgress: "inProgress",

    Completed: "completed",
} as const;

/**
 * Since TypeScript's `enum` can be inconvenient to work with, some packages define their own enum-like objects:
 *
 * ```
 * export const EnumLikeObjectNumValues = {
 *     Pending: 1,
 *     InProgress: 2,
 *     Completed: 3
 * } as const
 * ```
 *
 * Use the `@enum` tag to make TypeDoc document this object as an enum.
 *
 * @enum
 */
export const EnumLikeObjectNumValues = {
    Pending: 1,

    /** Indicates that a courier is en route delivering this order. */
    InProgress: 2,

    Completed: 3,
} as const;

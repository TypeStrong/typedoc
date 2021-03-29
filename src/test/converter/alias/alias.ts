/**
 * A type that describes a compare function, e.g. for array.sort().
 */
export type TCompareFunction<T> = (a: T, b: T) => number;

/**
 * A type for IDs.
 */
export type TId = number | string;

/**
 * Conditional types from TS2.8
 */
export type IsString<T> = T extends string ? "string" : "not string";

/**
 * Extracts the type of a promise.
 */
export type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

/**
 * A type that describes a compare function, e.g. for array.sort().
 */
declare type TCompareFunction<T> = (a: T, b: T) => number;

/**
 * A type for IDs.
 */
declare type TId = number | string;

/**
 * Conditional types from TS2.8
 */
type IsString<T> = T extends string ? 'string' : 'not string';

/**
 * Extracts the type of a promise.
 */
type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

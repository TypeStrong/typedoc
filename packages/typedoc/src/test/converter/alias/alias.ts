/**
 * A type that describes a compare function, e.g. for array.sort().
 */
declare type TCompareFunction<T> = (a: T, b: T) => number;

/**
 * A type for IDs.
 */
declare type TId = number | string;
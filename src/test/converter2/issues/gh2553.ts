/**
 * Constructor.
 *
 * @param args - Constructor arguments.
 * @returns New instance.
 */
export type Constructor = new (...args: any[]) => object;

/**
 * Typed constructor.
 *
 * @typeParam T - Class type.
 * @param args - Constructor arguments.
 * @returns New instance.
 */
export type TypedConstructor<T> = new (...args: any[]) => T;

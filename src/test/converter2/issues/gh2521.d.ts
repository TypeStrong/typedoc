/**
 * Original comment.
 */
export interface Foo {
    /** Overload 1 */
    (): void;
    /** Overload 2 */
    (baz: number): void;
}

// Inherits overload comments, but not Foo comment
// Foo comment could be inherited with {@inheritDoc Foo}
/** @function */
export const fooWithoutComment: Foo;

/**
 * New comment.
 * @function
 */
export const fooWithComment: Foo;

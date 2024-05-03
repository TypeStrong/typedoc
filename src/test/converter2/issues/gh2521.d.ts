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
export const fooWithoutComment: Foo;

/**
 * New comment.
 */
export const fooWithComment: Foo;

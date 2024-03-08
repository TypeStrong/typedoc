/**
 * Original comment.
 */
export interface Foo {
    /** Overload 1 */
    (): void;
    /** Overload 2 */
    (baz: number): void;
}

export const fooWithoutComment: Foo;

/** 
 * New comment.
 */
export const fooWithComment: Foo;

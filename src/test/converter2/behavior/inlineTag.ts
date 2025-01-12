/** @inline */
type Foo = { inlined: true };

/** @inline */
type Complex<T> = { real: T; imag: T };

export function foo(param: Foo): Complex<number> {
    return { real: 1.0, imag: 2.0 };
}

export function genericInline<T>(): Complex<T> {
    throw new Error();
}

// TypeNode, nested
export function bar(param: Record<string, Foo>) {}

export class Class {
    // Type * 2
    foo(param: Foo): Complex<number> {
        return { real: 1.0, imag: 2.0 };
    }

    // Type, nested
    bar(param: Record<string, Foo>) {}
}

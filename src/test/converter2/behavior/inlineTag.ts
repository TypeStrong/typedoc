/** @inline */
type Foo = { inlined: true };

type Bar = { inlined: false };

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

// TypeNode, prevented
/** @preventInline Foo */
export function bar2(param: Record<string, Foo>) {}

export class Class {
    // Type * 2
    foo(param: Foo): Complex<number> {
        return { real: 1.0, imag: 2.0 };
    }

    // Type, nested
    bar(param: Record<string, Foo>) {}

    // Type * 2 - prevented
    /**
     * @preventInline Foo
     * @preventInline Complex
     */
    baz(param: Foo): Complex<number> {
        return { real: 1.0, imag: 2.0 };
    }
}

/** @inlineType Bar */
export function selectiveInline(bar: Bar) {
}

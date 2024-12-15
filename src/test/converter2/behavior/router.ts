export interface Foo {
    /** {@link Nested.refl} */
    codeGeneration?: {
        strings: boolean;
        wasm: boolean;
    };

    iterator(options?: {
        destroyOnReturn?: boolean;
    }): AsyncIterableIterator<any>;
}

// `a` gets an anchor because it is directly within a type alias
/** @category CustomCat */
export type Obj = { a: string };

/** @group Abc/Group */
export const abc = { abcProp: { nested: true } };

// `b` does NOT get an anchor as it isn't a direct descendent
export type ObjArray = { b: string }[];

export function Func(param: string): { noUrl: boolean } {
    return { noUrl: !!param };
}

// Duplicate name with different case
export function func() {}

export namespace Nested {
    /** {@link Foo.codeGeneration} */
    export const refl = 1;
}

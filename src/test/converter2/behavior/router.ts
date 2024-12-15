export interface Foo {
    codeGeneration?: {
        strings: boolean;
        wasm: boolean;
    };

    iterator(options?: {
        destroyOnReturn?: boolean;
    }): AsyncIterableIterator<any>;
}

// `a` gets an anchor because it is directly within a type alias
export type Obj = { a: string };

export const abc = { abcProp: { nested: true } };

// `b` does NOT get an anchor as it isn't a direct descendent
export type ObjArray = { b: string }[];

export function Func(param: string): { noUrl: boolean } {
    return { noUrl: !!param };
}

// Duplicate name with different case
export function func() {}

export namespace Nested {
    export const refl = 1;
}

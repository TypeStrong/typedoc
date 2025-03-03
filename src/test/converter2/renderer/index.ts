/**
 * Module comment
 *
 * @module RendererTests
 * @document doc.md
 */

// Exports from this file will be rendered for the renderer snapshot testing

/** Renderer class */
export class RenderClass {
    /** Index signature */
    [k: string]: unknown;

    /** Property */
    prop: string = "abc";

    /** Ctor comment */
    constructor(x: string) {}

    /** Method comment */
    method(x: string) {}

    /** Sig 1 comment */
    overloaded(): string;
    /** Sig 2 comment */
    overloaded(p: string): number;
    /** Method comment */
    overloaded(p?: string): number | string {
        return 1;
    }
}

/** Generic class */
export class GenericClass<out T extends string = ""> {
    genericMethod<U extends T>() {}
}

/**
 * Enum comment {@link Value1}
 * @remarks Block tag
 */
export enum Enumeration {
    /** Value1 comment */
    Value1,
    /** Value2 comment */
    Value2 = Value1,
}

/** Type alias with nested properties */
export type Nested = {
    options: {
        /** Value */
        value?: string;
        /** Another value */
        anotherValue?: string;
        /** More options */
        moreOptions?: {
            moreValues: number;
        };
        emptyObject: {};
    };
};

export type UnionComments =
    /** Commentary on abc */
    | "abc"
    /** Commentary on def */
    | "def";

/**
 * Signature comment
 * @param item Item comment
 */
export function box<T>(item: T) {
    return { box: item };
}

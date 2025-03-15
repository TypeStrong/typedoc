/**
 * Module comment
 *
 * @module RendererTests
 * @document doc.md
 */

// Exports from this file will be rendered for the renderer snapshot testing

export interface BaseInterface {
    /** Interface method */
    method(x: string): void;

    base(): void;
}

export abstract class BaseClass {
    /** Base class method */
    method(x: string) {}

    base() {}
}

/** Renderer class */
export class RenderClass extends BaseClass {
    /** Index signature */
    [k: string]: unknown;

    /** Property */
    prop: string = "abc";

    /** Ctor comment */
    constructor(x: string) {
        super();
    }

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

    get getter() {
        return 1;
    }

    get getSet() {
        return 1;
    }
    set getSet(value: number) {}
}

/** Generic class */
export class GenericClass<out T extends string = ""> {
    genericMethod<U extends T>() {}
}

export class ModifiersClass {
    protected prot = 1;
    private priv = 2;
    public pub = 3;
    readonly read = 4;
    /** @deprecated */
    dep = 5;
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

export * as ExpandType from "./expandType";

/**
 * Variable class
 * @class
 */
export const VariableClass = class {
    /** Stat docs */
    static stat = 1;
    /** Inst docs */
    inst = "2";
};

/**
 * Normal classes can't have call signatures, but this does.
 * @class
 */
export declare const CallableClass: {
    /** Stat docs */
    stat: string;
    /** Static signature */
    (): number;
} & {
    /** Ctor docs */
    new (): {
        /** Call docs */
        (): string;

        /** Inst docs */
        inst: string;
        /** Method docs */
        method(): string;
    };
};

/**
 * Will not be converted because the class is declared with `@class`
 */
export type CallableClass = any;

/** @class */
export const BadClass = 123;

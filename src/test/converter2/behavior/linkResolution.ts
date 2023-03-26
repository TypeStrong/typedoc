export namespace Scoping {
    // TypeScript / TypeDoc
    /** {@link abc | def} */
    export type abc = 1;

    /** {@link abc} 2/2 */
    export namespace Foo {
        /** {@link abc} 2/2 */
        export type abc = 2;

        export function bar(): undefined;
        export function bar(x: number): number;
        export function bar(x?: number): number | undefined {
            return x;
        }
    }

    /** {@link abc} 1/1 */
    export interface Bar {
        /** {@link abc} 1/1 */
        abc: 3;
    }
}

/**
 * TS doesn't recognize any of these, and will link them to the namespace
 * {@link Meanings!A}
 * {@link Meanings!A:namespace}
 * {@link Meanings!A:enum}
 *
 * {@link A:class} doesn't exist, ts links to enum/ns, TypeDoc picks the enum
 * {@link B:class}
 *
 * {@link C:interface}
 * {@link D:type}
 * {@link E:function}
 * {@link F:var}
 *
 * {@link B:constructor}
 * {@link B:constructor(0)}
 * {@link B:constructor(1)}
 *
 * {@link A.A:member}
 * {@link B.prop:event} Don't use this. It doesn't work with TSDoc resolution but is required by the grammar.
 *
 * {@link E:call}
 * {@link E:call(1)}
 *
 * {@link B:new}
 * {@link B:new(1)}
 *
 * {@link B:index}
 * {@link G:complex}
 *
 * {@link E:1}
 * {@link B:0} Weird, but technically ok
 */
export namespace Meanings {
    export enum A {
        A,
        B,
    }
    export namespace A {
        export const a = 123;
    }

    export class B {
        constructor();
        constructor(x: number);
        constructor(_?: number) {}

        /** @event */
        prop = 1;

        [x: string]: number;
    }

    export interface C {}

    export type D = 123;

    export function E(): void;
    export function E(x: number): number;
    export function E(x?: number) {
        return x;
    }

    export const F = 123;

    export interface G {}
    export namespace G {}
}

/**
 * {@link https://example.com}
 * {@link ftp://example.com}
 */
export namespace URLS {}

export const A = 1;

export namespace Globals {
    /**
     * {@link URLS!}
     * {@link !A}
     * {@link A}
     */
    export const A = 2;
}

/**
 * {@link Navigation~Child.foo}
 * {@link Navigation.Child#foo}
 * {@link Child~foo} bad
 */
export namespace Navigation {
    export class Child {
        /**
         * {@link foo} Child.foo, not Child#foo
         */
        static foo() {}
        foo = 456;
    }
}

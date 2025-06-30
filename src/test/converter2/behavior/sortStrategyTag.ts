/** @sortStrategy source-order */
export namespace A {
    export const b = 1;
    export function c() {}
    export const a = 2;
}

/** @sortStrategy alphabetical */
export namespace B {
    export function c() {}
    export const b = 1;
    export const a = 1;
}

// Default is kind then alphabetical
export namespace C {
    export const c = 1;
    export function a() {}
    export const b = 1;
}

/** @sortStrategy source-order */
export namespace D {
    /** @category Cat */
    export const b = 1;
    /** @category Cat */
    export const a = 1;
    /** @category Cat */
    export const c = 1;
}

/** @sortStrategy invalid, source-order, invalid2 */
export namespace E {}

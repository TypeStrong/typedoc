/** Class comment */
class _Vec {
    mag() {}
}

/** Type comment */
type _IsInt<T extends number> = `${T}` extends `${bigint}` ? true : false;

/** Func comment */
function _makeVec(x: number, y: number, z: number): _Vec {
    return new _Vec();
}

export namespace Math {
    // /** Alias comment @alias */
    export type IsInt<T extends number> = _IsInt<T>;

    /** Alias comment @alias */
    export const Vec = _Vec;
    export type Vec = typeof _Vec;

    /** Alias comment @alias */
    export const makeVec = _makeVec;

    /** @alias */
    export type BadAlias = 123;
}

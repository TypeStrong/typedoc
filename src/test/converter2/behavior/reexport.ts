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
    /** Alias comment @reexport */
    export type IsInt<T extends number> = _IsInt<T>;

    /** Alias comment @reexport */
    export const Vec = _Vec;
    export type Vec = typeof _Vec;

    /** Alias comment @reexport */
    export const makeVec = _makeVec;

    /** @reexport */
    export type BadAlias = 123;
}

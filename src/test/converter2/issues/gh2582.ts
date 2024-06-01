function getApi<T>(Ctor: new () => T) {
    return {
        /** Member comment */
        member: 1,
        /** Fn comment */
        fn: () => new Ctor(),
    };
}

function getAPIs<T1, T2>(Ctor1: new () => T1, Ctor2: new () => T2) {
    const a = getApi(Ctor1);

    return {
        /** A comment @namespace*/
        a,
        /** B comment @namespace */
        b: getApi(Ctor2),
    };
}

/** f32 comment @namespace */
export const f32 = getAPIs(Float32Array, Float64Array);

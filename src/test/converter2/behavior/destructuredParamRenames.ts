/**
 * @param params - desc
 * @param params.a - paramZ desc
 */
export function singleParam({ a }: { a: string }) {
    return 0;
}

/**
 * @param params - desc
 */
export function extraParam({ a }: { a: string }, extraParameter: string) {
    return 0;
}

/**
 * @param params param
 * @param fakeParameter param2
 */
export function extraParamComment({ a }: { a: string }) {
    return 0;
}

/**
 * @param params params
 * @param params2 params2
 */
export function multiParam(
    { a }: { a: string },
    { b }: { b: number },
    { c }: { c: boolean },
) {
    return 0;
}

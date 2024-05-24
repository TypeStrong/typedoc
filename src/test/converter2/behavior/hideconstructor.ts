// https://github.com/TypeStrong/typedoc/issues/2577

/** @hideconstructor */
export class StaticOnly {
    static foo() {}

    /** @hideconstructor */
    notHidden = true;
}

export class IgnoredCtor {
    /** @hideconstructor */
    constructor() {}
}

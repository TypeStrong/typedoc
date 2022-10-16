function factory() {
    /** inner docs */
    function fn() {}
    return fn;
}

export const built = factory();

/** outer docs */
export const built2 = factory();

const obj = {
    /** inner docs */
    fn(x: unknown) {},
};

export const fn = obj.fn;

/**
 * outer docs
 * @param x param-docs
 */
export const fn2 = obj.fn;

function factory() {
    /** inner docs */
    function fn() {}
    return fn;
}

/** @function */
export const built = factory();

/** outer docs @function */
export const built2 = factory();

const obj = {
    /** inner docs */
    fn(x: unknown) {},
};

/** @function */
export const fn = obj.fn;

/**
 * outer docs
 * @param x param-docs
 * @function
 */
export const fn2 = obj.fn;

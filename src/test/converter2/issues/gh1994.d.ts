/**
 *
 * test 2
 */
declare class Collection {

    /**
     *
     * @param {boolean} n Test boolean
     */
    public case1(n: boolean)
    public case1(n: number)
    private case2()
}


/**
 * Comment for case4
 */
export declare type Case4 = {
    case5: string;

    /**
     * comment for case6
     *
     * @param number1 test comment
     */
    case6: (number1: number) => boolean;
}

/**
 * Comment for case7
 */
export declare type case7 = (number1: number) => boolean;

/**
 * Rounds or truncates a number to a specified precision.
 *
 * @param value Value to round or truncate.
 * @param prec Number of decimal digits for the result.
 * @param truncate Whether to truncate or round the original value.
 */
declare function case3(value: number, prec: number, truncate: boolean): number;

export {
    Collection,
    case3
}

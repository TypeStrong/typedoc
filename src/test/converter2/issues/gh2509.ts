export interface Int {
    /** Cb */
    cb: () => Promise<any>;

    nested: {
        /** Cb2 */
        cb: () => any;
    };
}

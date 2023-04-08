/**
 * Foo docs
 */
export type Foo = {
    /**
     * Foo.a docs
     */
    a: 123;
    /**
     * Foo.b docs
     */
    b: 456;
};

/**
 * Bar docs
 * @property a Bar.a docs
 * @interface
 */
export type Bar = {
    [K in keyof Foo]: string;
};

declare function test(options?: test.Options): void;

declare namespace test {
    /** Test options */
    interface Options {
        a: string;
        b: number;
    }
}

export { test };

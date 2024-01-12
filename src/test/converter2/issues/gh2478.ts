declare const test: (options?: test.Options) => void;

declare namespace test {
    interface Options {
        a: string;
        b: number;
    }
}

export { test };

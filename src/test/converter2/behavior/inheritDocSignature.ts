// TS Discord March 24 2023 bug
// See https://discord.com/channels/508357248330760243/829307039447515176/1088969324770897931

export class SigRef {
    /** A */
    method(): void;
    /** B */
    method(x: string): string;
    method(x?: string) {
        return x;
    }

    /** C */
    prop = 2;

    /** {@inheritDoc method} */
    test1(): void;

    /** {@inheritDoc method} */
    test1(x: string): string;
    test1(x?: string) {
        return x;
    }

    /** {@inheritDoc prop} */
    test2() {}
}

export interface Bar {
    /** Some property style doc. */
    baz: () => number;
}

export class Foo implements Bar {
    baz(): number {
        return 0;
    }
}

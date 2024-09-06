export abstract class Foo {
    abstract foo(): void;

    abstract x: number;
}

/** @abstract */
export class Bar {
    /** @abstract */
    foo() {}

    /** @abstract */
    x!: number;
}

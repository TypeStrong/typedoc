export class Foo {
    /** getter */
    get x() {
        return 1;
    }
    /** setter */
    set x(value: number) {
        throw new Error();
    }
}

export class Bar {
    /** {@inheritDoc Foo.x} */
    x = 1;
    /** {@inheritDoc Foo.x:getter} */
    y = 2;
    /** {@inheritDoc Foo.x:setter} */
    z = 3;
}

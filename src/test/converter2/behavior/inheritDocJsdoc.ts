/** Foo */
export class Foo {
    /**
     * Foo.member
     * @param x Foo.member.x
     */
    member(x: number) {}
}

/** @inheritdoc */
export class Bar implements Foo {
    /** @inheritdoc */
    member(x: number) {}
}

export class Baz extends Foo {
    /** @inheritdoc */
    override member(x: number): void {}
}

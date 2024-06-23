/** Parent docs */
abstract class Parent {
    /** notAbstract docs  */
    notAbstract(): void {}
    /** notAbstract2 docs */
    notAbstract2(): void {}
    /** isAbstract docs */
    abstract isAbstract(): void;
    /** abstractProperty docs */
    abstract abstractProperty: string;
}

export class Child extends Parent {
    override notAbstract2(): void {}
    override isAbstract(): void {}

    override abstractProperty = "";
}

// #2084
export class Foo {
    /** @internal*/
    isInternal() {}
}

export class Bar extends Foo {
    isInternal() {} // also internal
}
